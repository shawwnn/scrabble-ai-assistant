import { Router } from "express";

import { getWordsFromMove } from "../game/words.js";
import { checkWords, type DictionaryName } from "../game/dictionary.js";

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

  console.log("BACKEND RECEIVED:", moveTiles);

  const formedWords = getWordsFromMove(moveTiles);

  console.log("WORDS FORMED:", formedWords);

  const words = formedWords.map(({ word }) => word);

  const selectedDictionary: DictionaryName = dictionary ?? "UK";

  const result = checkWords(selectedDictionary, words);

  console.log("DICTIONARY RESULT:", result);

  res.json({
    status: result.valid ? "valid" : "invalid",
    words: formedWords,
    invalidWords: result.invalidWords,
    dictionary: result.dictionary,
  });
});

export default router;
