import type { ScrabbleBoardSeed } from "./inedible-board";

/** OCR/board-analysis fixture for a new game with the T?UMAEI rack. */
export const taediumBoardSeed: ScrabbleBoardSeed = {
  board: { cols: "A-O", rows: "1-15" },
  last_active_word: null,
  words: [],
  occupied_tiles: {},
  rack: ["T", "?", "U", "M", "A", "E", "I"],
  top_suggested_by_user: {
    length: 7,
    words: ["IDEATUM", "MURIATE", "TAEDIUM"],
  },
};
