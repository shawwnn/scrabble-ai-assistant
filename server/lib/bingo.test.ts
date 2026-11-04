import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { BoardTileInput } from "@shared/api";
import { analyzeBoard } from "./analyze";
import { createDictionary } from "./dictionary";

const realListPath = path.resolve(process.cwd(), "dictionaries", "CSW2024.txt");
const realListPresent = existsSync(realListPath);

// Places a word starting at (row, col). Horizontal words run left to right; vertical words run top to bottom.
function place(word: string, row: number, col: number, horizontal: boolean): BoardTileInput[] {
  return [...word].map((letter, index) => ({
    row: horizontal ? row : row + index,
    col: horizontal ? col + index : col,
    letter,
  }));
}

describe("bingo detection", () => {
  it("finds a seven-tile bingo on an empty board and prefers the lower row on equal scores", () => {
    // Best placement: P on a double-letter square (6), other letters 1 each = 12, center double-word = 24, plus 50 = 74.
    // The same play is available horizontally from (7, 3) and vertically from (3, 7); the lower row wins the tie.
    const { recommendation } = analyzeBoard([], ["P", "A", "I", "N", "T", "E", "R"], createDictionary(["PAINTER"]));
    expect(recommendation).toMatchObject({
      word: "PAINTER",
      direction: "vertical",
      row: 3,
      col: 7,
      bingo: true,
      bingoBonus: 50,
      score: 74,
      crosswords: [],
    });
    expect(recommendation.tiles).toHaveLength(7);
  });

  it("recognizes a seven-tile play that extends a board word into a nine-letter bingo", () => {
    // RE on the board plus seven rack tiles form REPAINTED across row 7.
    // Letters: R1 E1 P3 A1 I1 N(double letter)2 T1 E1 D2 = 13, D lands on the triple-word square (x3) = 39, plus 50.
    const board = place("RE", 7, 6, true);
    const { recommendation } = analyzeBoard(board, ["P", "A", "I", "N", "T", "E", "D"], createDictionary(["RE", "REPAINTED"]));
    expect(recommendation).toMatchObject({
      word: "REPAINTED",
      direction: "horizontal",
      row: 7,
      col: 6,
      bingo: true,
      bingoBonus: 50,
      score: 89,
      crosswords: [],
    });
    expect(recommendation.tiles.map(({ col }) => col)).toEqual([8, 9, 10, 11, 12, 13, 14]);
  });

  it.skipIf(!realListPresent)(
    `finds a seven-tile bingo with the real CSW2024 list${realListPresent ? "" : " (skipped until dictionaries/CSW2024.txt is provided)"}`,
    () => {
      const dictionary = createDictionary(readFileSync(realListPath, "utf8").split(/\r?\n/));
      const rack = ["A", "E", "I", "N", "R", "S", "T"];
      const { recommendation } = analyzeBoard([], rack, dictionary);
      expect(recommendation.bingo).toBe(true);
      expect(recommendation.tiles).toHaveLength(7);
      expect([...recommendation.word].sort()).toEqual([...rack].sort());
      expect(dictionary.isWord(recommendation.word)).toBe(true);
    },
  );
});
