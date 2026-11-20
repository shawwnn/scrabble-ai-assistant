import type { ScrabbleBoardSeed } from "./inedible-board";

/** OCR/board-analysis fixture for a new game with the LOXIPID rack. */
export const loxipidBoardSeed: ScrabbleBoardSeed = {
  board: { cols: "A-O", rows: "1-15" },
  last_active_word: null,
  words: [],
  occupied_tiles: {},
  rack: ["L", "O", "X", "I", "P", "I", "D"],
};
