import { RequestHandler } from "express";
import { z } from "zod";
import type { AnalyzeErrorResponse, AnalyzeRequest, AnalyzeResponse } from "@shared/api";
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

  const body: AnalyzeResponse = { dictionary: dictionaryName, recommendation: result.recommendation };
  res.json(body);
};
