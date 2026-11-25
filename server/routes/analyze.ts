import { RequestHandler } from "express";
import { z } from "zod";
import type { AnalyzeErrorResponse, AnalyzeRequest, AnalyzeResponse, BoardTileInput, ImageAnalyzeRequest, ImageAnalyzeErrorCode } from "@shared/api";
// Relative path: vite.config.ts loads the server before path aliases are available.
import { DICTIONARY_NAMES } from "../../shared/api";
import { analyzeBoard } from "../lib/analyze";
import { DictionaryUnavailableError, loadDictionary } from "../lib/dictionary";
import { RACK_SIZE } from "../lib/score";
import { boardExtractionSchema } from "../../shared/image-extraction";

const letter = z.string().regex(/^[A-Za-z]$/);

const analyzeRequest = z.object({
  board: z.array(
    z.object({
      row: z.number().int(),
      col: z.number().int(),
      letter,
      blank: z.boolean().optional(),
    }),
  ),
  rack: z.array(letter).min(1).max(RACK_SIZE),
  dictionary: z.enum(DICTIONARY_NAMES).default("CSW2024"),
});

const imageAnalyzeRequest = z.object({
  image: z.object({
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    data: z.string().min(1).max(14_000_000),
  }),
  dictionary: z.enum(DICTIONARY_NAMES).default("CSW2024"),
});

const ocrResponse = boardExtractionSchema;

class ImageAnalyzeFailure extends Error {
  constructor(
    readonly code: ImageAnalyzeErrorCode,
    readonly status: number,
    readonly reason: string,
  ) {
    super(reason);
  }
}

function logImageAnalyzeFailure(failure: ImageAnalyzeFailure): void {
  console.error(`[image-analyze] ${failure.code} status=${failure.status} reason=${failure.reason}`);
}

export async function recognizeBoard(image: { mimeType: string; data: string }): Promise<{ board: BoardTileInput[]; rack: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ImageAnalyzeFailure("OPENAI_API_ERROR", 503, "OpenAI API key is not configured");
  const model = process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini";
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        input: [{ role: "user", content: [
          { type: "input_text", text: "Read this Scrabble screenshot. Return only JSON with board (occupied tiles using zero-based row and col, letter, and optional blank) and rack (visible rack letters). If this is not a clear Scrabble board with a visible rack, return {\"board\":[],\"rack\":[]}. Do not guess unreadable tiles." },
          { type: "input_image", image_url: `data:${image.mimeType};base64,${image.data}` },
        ] }],
        text: { format: { type: "json_schema", name: "scrabble_board", strict: true, schema: {
          type: "object", properties: {
            board: { type: "array", items: { type: "object", properties: { row: { type: "integer" }, col: { type: "integer" }, letter: { type: "string" }, blank: { type: "boolean" } }, required: ["row", "col", "letter"], additionalProperties: false } },
            rack: { type: "array", items: { type: "string" } },
          }, required: ["board", "rack"], additionalProperties: false,
        } } },
      }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch (error) {
    throw new ImageAnalyzeFailure("OPENAI_API_ERROR", 502, error instanceof Error && error.name === "TimeoutError" ? "OpenAI request timed out" : "OpenAI request failed");
  }
  if (!response.ok) {
    const status = response.status;
    const reason = status === 401 || status === 403
          ? `OpenAI rejected the API credentials (HTTP ${status})`
      : status === 404
        ? `OpenAI model is unavailable (HTTP ${status})`
        : status === 429
          ? "OpenAI quota or rate limit reached (HTTP 429)"
          : `OpenAI returned HTTP ${status}`;
    throw new ImageAnalyzeFailure("OPENAI_API_ERROR", status === 429 ? 429 : 502, reason);
  }
  let payload: { output_text?: string };
  try {
    payload = await response.json() as typeof payload;
  } catch {
    throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "OpenAI response was not valid JSON");
  }
  const text = payload.output_text;
  if (!text) throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "OpenAI response contained no OCR text");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "OpenAI OCR text was not valid JSON"); }
  const parsed = ocrResponse.safeParse(value);
  if (!parsed.success) throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "OpenAI OCR data failed validation");
  if (parsed.data.rack.length === 0) throw new ImageAnalyzeFailure("IMAGE_NOT_RECOGNIZED", 422, "No Scrabble rack was recognized");
  return parsed.data as { board: BoardTileInput[]; rack: string[] };
}

export const handleAnalyze: RequestHandler = (req, res) => {
  const parsed = analyzeRequest.safeParse(req.body);
  if (!parsed.success) {
    const body: AnalyzeErrorResponse = {
      error: "Invalid analyze request",
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
    res.status(400).json(body);
    return;
  }

  // Zod infers keys as optional when strictNullChecks is off, so the parsed shape is asserted.
  const { board, rack, dictionary: dictionaryName } = parsed.data as AnalyzeRequest;
  let dictionary;
  try {
    dictionary = loadDictionary(dictionaryName);
  } catch (error) {
    if (error instanceof DictionaryUnavailableError) {
      const body: AnalyzeErrorResponse = { error: error.message };
      res.status(503).json(body);
      return;
    }
    throw error;
  }

  const result = analyzeBoard(board, rack, dictionary);
  if (result.issues.length > 0) {
    const body: AnalyzeErrorResponse = { error: "Board cannot be analyzed", issues: result.issues };
    res.status(400).json(body);
    return;
  }

  const body: AnalyzeResponse = { dictionary: dictionaryName, recommendation: result.recommendation, suggestions: result.suggestions };
  res.json(body);
};

export const handleImageAnalyze: RequestHandler = async (req, res) => {
  const parsed = imageAnalyzeRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid image upload", issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) });
    return;
  }
  try {
    const { image, dictionary: dictionaryName } = parsed.data as ImageAnalyzeRequest;
    const { board, rack } = await recognizeBoard(image);
    const dictionary = loadDictionary(dictionaryName);
    const result = analyzeBoard(board, rack, dictionary);
    if (result.issues.length > 0) {
      res.status(422).json({ error: "Recognized board cannot be analyzed", issues: result.issues });
      return;
    }
    const body: AnalyzeResponse = { dictionary: dictionaryName, recommendation: result.recommendation, suggestions: result.suggestions, extracted: { board, rack } };
    res.json(body);
  } catch (error) {
    const failure = error instanceof ImageAnalyzeFailure
      ? error
      : new ImageAnalyzeFailure("OPENAI_API_ERROR", 502, "Unexpected image analysis failure");
    logImageAnalyzeFailure(failure);
    const geminiMessage = failure.reason.includes("credentials")
      ? "The AI service credentials were rejected. Please contact the administrator."
      : failure.reason.includes("quota or rate limit")
        ? "The AI service is busy or its quota has been reached. Please try again later."
        : failure.reason.includes("model is unavailable")
          ? "The AI model configuration is unavailable. Please contact the administrator."
          : failure.reason.includes("timed out")
            ? "The AI service did not respond in time. Please try again."
            : "The AI service is temporarily unavailable. Please try again later.";
    const messages = {
      OPENAI_API_ERROR: geminiMessage,
      IMAGE_NOT_RECOGNIZED: "We couldn't find a recognizable Scrabble board and rack in this image.",
      OCR_EXTRACTION_FAILED: "The image was received, but its board and rack data could not be extracted.",
    } satisfies Record<ImageAnalyzeErrorCode, string>;
    res.status(failure.status).json({ code: failure.code, error: messages[failure.code] });
  }
};
