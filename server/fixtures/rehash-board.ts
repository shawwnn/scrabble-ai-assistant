import type { ScrabbleBoardSeed } from "./inedible-board";

export type PreferredBestMove = {
  word: string;
  direction: "across" | "down";
  coords: string[];
  uses_existing_tile: {
    letter: string;
    coord: string;
  };
};

/** OCR/board-analysis fixture for the uploaded REHASH game position. */
export const rehashBoardSeed: ScrabbleBoardSeed & { preferred_best_move: PreferredBestMove } = {
  board: { cols: "A-O", rows: "1-15" },
  last_active_word: {
    word: "REHASH",
    direction: "across",
    coords: ["C9", "D9", "E9", "F9", "G9", "H9"],
    hook: { letter: "P", coord: "H8", forms: "REHASH" },
  },
  preferred_best_move: {
    word: "INEDIBLE",
    direction: "across",
    coords: ["B6", "C6", "D6", "E6", "F6", "G6", "H6", "I6"],
    uses_existing_tile: { letter: "L", coord: "H6" },
  },
  words: [
    { word: "OXLIP", direction: "down", coords: ["H4", "H5", "H6", "H7", "H8"] },
    { word: "REHASH", direction: "across", coords: ["C9", "D9", "E9", "F9", "G9", "H9"], is_last_active: true },
  ],
  occupied_tiles: {
    H4: "O", H5: "X", H6: "L", H7: "I", H8: "P",
    C9: "R", D9: "E", E9: "H", F9: "A", G9: "S", H9: "H",
  },
  rack: ["B", "I", "N", "E", "D", "I", "E"],
};
