export type SeedWord = {
  word: string;
  direction: "across" | "down";
  coords: string[];
  is_last_active?: boolean;
};

export type LastActiveWord = {
  word: string;
  direction: "across" | "down";
  coords: string[];
  hook: {
    letter: string;
    coord: string;
    forms: string;
    via?: string[];
  };
};

export type ScrabbleBoardSeed = {
  board: {
    cols: string;
    rows: string;
  };
  last_active_word: LastActiveWord | null;
  words: SeedWord[];
  occupied_tiles: Record<string, string>;
  rack: string[];
  top_suggested_by_user?: {
    length: number;
    words: string[];
  };
};

/** OCR/board-analysis fixture for the uploaded INEDIBLE game position. */
export const inedibleBoardSeed: ScrabbleBoardSeed = {
  board: { cols: "A-O", rows: "1-15" },
  last_active_word: {
    word: "ENVY",
    direction: "across",
    coords: ["H10", "I10", "J10", "K10"],
    hook: { letter: "H", coord: "H9", forms: "HE", via: ["H9", "H10"] },
  },
  words: [
    { word: "INEDIBLE", direction: "across", coords: ["B6", "C6", "D6", "E6", "F6", "G6", "H6", "I6"] },
    { word: "OXLIPS", direction: "down", coords: ["H4", "H5", "H6", "H7", "H8", "H9"] },
    { word: "REHASH", direction: "across", coords: ["C9", "D9", "E9", "F9", "G9", "H9"] },
    { word: "HE", direction: "down", coords: ["H9", "H10"] },
    { word: "ENVY", direction: "across", coords: ["H10", "I10", "J10", "K10"], is_last_active: true },
  ],
  occupied_tiles: {
    H4: "O", H5: "X",
    B6: "I", C6: "N", D6: "E", E6: "D", F6: "I", G6: "B", H6: "L", I6: "E",
    H7: "I", H8: "P",
    C9: "R", D9: "E", E9: "H", F9: "A", G9: "S", H9: "S",
    H10: "E", I10: "N", J10: "V", K10: "Y",
  },
  rack: ["U", "D", "I", "E", "K", "E", "E"],
};
