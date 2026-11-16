import { RequestHandler } from "express";
import { z } from "zod";
import type { AnalyzeErrorResponse, AnalyzeRequest, AnalyzeResponse, BoardTileInput, ImageAnalyzeRequest, ImageAnalyzeErrorCode } from "@shared/api";
// Relative path: vite.config.ts loads the server before path aliases are available.
import { DICTIONARY_NAMES } from "../../shared/api";
import { analyzeBoard } from "../lib/analyze";
import { DictionaryUnavailableError, loadDictionary } from "../lib/dictionary";
import { RACK_SIZE } from "../lib/score";

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

const ocrResponse = z.object({
  board: z.array(z.object({ row: z.number().int().min(0).max(14), col: z.number().int().min(0).max(14), letter: letter.transform((value) => value.toUpperCase()), blank: z.boolean().optional() })),
  rack: z.array(letter.transform((value) => value.toUpperCase())).max(RACK_SIZE),
});

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ImageAnalyzeFailure("GEMINI_API_ERROR", 503, "Gemini API key is not configured");
  const model = process.env.GEMINI_TEST_MODEL ?? "gemini-2.5-flash";
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Read this Scrabble screenshot. Return only JSON with board (occupied tiles using zero-based row and col, letter, and optional blank) and rack (visible rack letters). If this is not a clear Scrabble board with a visible rack, return {\"board\":[],\"rack\":[]}. Do not guess unreadable tiles." },
          { inline_data: { mime_type: image.mimeType, data: image.data } },
        ] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: { type: "OBJECT", properties: {
            board: { type: "ARRAY", items: { type: "OBJECT", properties: { row: { type: "INTEGER" }, col: { type: "INTEGER" }, letter: { type: "STRING" }, blank: { type: "BOOLEAN" } }, required: ["row", "col", "letter"] } },
            rack: { type: "ARRAY", items: { type: "STRING" } },
          }, required: ["board", "rack"] },
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    throw new ImageAnalyzeFailure("GEMINI_API_ERROR", 502, error instanceof Error && error.name === "TimeoutError" ? "Gemini request timed out" : "Gemini request failed");
  }
  if (!response.ok) throw new ImageAnalyzeFailure("GEMINI_API_ERROR", response.status === 429 ? 429 : response.status >= 500 ? 502 : 502, `Gemini returned HTTP ${response.status}`);
  let payload: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  try {
    payload = await response.json() as typeof payload;
  } catch {
    throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "Gemini response was not valid JSON");
  }
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "Gemini response contained no OCR text");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "Gemini OCR text was not valid JSON"); }
  const parsed = ocrResponse.safeParse(value);
  if (!parsed.success) throw new ImageAnalyzeFailure("OCR_EXTRACTION_FAILED", 502, "Gemini OCR data failed validation");
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
    const body: AnalyzeResponse = { dictionary: dictionaryName, recommendation: result.recommendation, suggestions: result.suggestions };
    res.json(body);
  } catch (error) {
    const failure = error instanceof ImageAnalyzeFailure
      ? error
      : new ImageAnalyzeFailure("GEMINI_API_ERROR", 502, "Unexpected image analysis failure");
    logImageAnalyzeFailure(failure);
    const messages = {
      GEMINI_API_ERROR: "The AI service is temporarily unavailable. Please try again later.",
      IMAGE_NOT_RECOGNIZED: "We couldn't find a recognizable Scrabble board and rack in this image.",
      OCR_EXTRACTION_FAILED: "The image was received, but its board and rack data could not be extracted.",
    } satisfies Record<ImageAnalyzeErrorCode, string>;
    res.status(failure.status).json({ code: failure.code, error: messages[failure.code] });
  }
};
