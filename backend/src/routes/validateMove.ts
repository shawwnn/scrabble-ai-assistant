// backend / src / routes / validateMove.ts;

import { Router } from "express";

import { getWordsFromMove } from "../game/words.js";
import { checkWords, type DictionaryName } from "../game/dictionary.js";
import { scoreMove } from "../game/scoring.js";

const router = Router();

type CurrentMoveTile = {
  key: string;
  letter: string;
  tile: Record<string, unknown>;
};

router.post("/", (req, res) => {
  const { currentMoveTiles, dictionary } = req.body as {
    currentMoveTiles: CurrentMoveTile[];
    dictionary?: DictionaryName;
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

  const selectedDictionary: DictionaryName = dictionary ?? "UK";

  const result = checkWords(selectedDictionary, words);

  console.log("DICTIONARY RESULT:", result);

  if (!result.valid) {
    return res.json({
      status: "invalid",
      totalProjectedScore: 0,
      words: formedWords,
      invalidWords: result.invalidWords,
      reason: `Some words are not valid in the ${result.dictionary} dictionary.`,
      dictionary: result.dictionary,
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
    dictionary: result.dictionary,
  });
});

export default router;
