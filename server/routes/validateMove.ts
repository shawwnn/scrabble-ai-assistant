// backend / src / routes / validateMove.ts;

import { Router } from "express";

import { getWordsFromMove } from "../game/words.js";
import { checkWords } from "../lib/dictionary";
import type { DictionaryName as SharedDictionaryName } from "@shared/api";
import { scoreMove } from "../game/scoring.js";

const router: Router = Router();

type CurrentMoveTile = {
  key: string;
  letter: string;
  tile: Record<string, unknown>;
};

type LegacyDictionaryName = "US" | "UK";

router.post("/", (req, res) => {
  const { currentMoveTiles, dictionary } = req.body as {
    currentMoveTiles: CurrentMoveTile[];
    dictionary?: LegacyDictionaryName;
  };

  const moveTiles = currentMoveTiles.map(
    ({ key, letter, tile }: CurrentMoveTile) => ({
      key,
      letter,
      tile,
    }),
  );

  console.log("BACKEND move tiles RECEIVED:", moveTiles);

  const formedWords = getWordsFromMove(moveTiles);

  console.log("WORDS FORMED:", formedWords);

  const words = formedWords.map(({ word }) => word);

  const selectedDictionary: LegacyDictionaryName = dictionary ?? "UK";
  const dictionaryName: SharedDictionaryName = selectedDictionary === "US" ? "NWL2023" : "CSW2024";

  // An empty word list is not a valid move. Without this guard, checkWords()
  // considers it valid because there are no invalid dictionary entries, which
  // incorrectly enables a one-tile opening placement.
  if (formedWords.length === 0) {
    return res.json({
      status: "invalid",
      totalProjectedScore: 0,
      words: [],
      invalidWords: [],
      reason: "Your move must create at least one word.",
      dictionary: selectedDictionary,
    });
  }

  const result = checkWords(dictionaryName, words);

  console.log("DICTIONARY RESULT:", result);

  if (!result.valid) {
    return res.json({
      status: "invalid",
      totalProjectedScore: 0,
      words: formedWords,
      invalidWords: result.invalidWords,
      reason: `Some words are not valid in the ${selectedDictionary} dictionary.`,
      dictionary: selectedDictionary,
    });
  }

  // Dictionary is valid → now calculate score
  const scoreResult = scoreMove(formedWords);

  console.log("SCORING RESULT:", scoreResult);

  return res.json({
    status: "valid",
    totalProjectedScore: scoreResult.totalProjectedScore,
    words: formedWords,
    invalidWords: [],
    reason: null,
    dictionary: selectedDictionary,
  });
});

export default router;
