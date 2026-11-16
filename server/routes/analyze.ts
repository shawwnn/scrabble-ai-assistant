import { RequestHandler } from "express";
import { z } from "zod";
import type { AnalyzeErrorResponse, AnalyzeRequest, AnalyzeResponse, BoardTileInput, ImageAnalyzeRequest } from "@shared/api";
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
  rack: z.array(letter.transform((value) => value.toUpperCase())).min(1).max(RACK_SIZE),
});

async function recognizeBoard(image: { mimeType: string; data: string }): Promise<{ board: BoardTileInput[]; rack: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini is not configured.");
  const model = process.env.GEMINI_TEST_MODEL ?? "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: "Read this Scrabble screenshot. Return only JSON with board (occupied tiles using zero-based row and col, letter, and optional blank) and rack (visible rack letters). Do not guess unreadable tiles." },
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
  if (!response.ok) throw new Error("Gemini OCR request failed.");
  const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no OCR result.");
  const parsed = ocrResponse.safeParse(JSON.parse(text));
  if (!parsed.success) throw new Error("Gemini returned invalid board or rack data.");
  return parsed.data;
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
    const message = error instanceof Error ? error.message : "Image analysis failed.";
    res.status(message === "Gemini is not configured." ? 503 : 502).json({ error: message });
  }
};
