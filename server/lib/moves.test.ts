import { describe, expect, it } from "vitest";
import type { BoardTileInput, Move } from "@shared/api";
import { analyzeBoard, selectBestMove } from "./analyze";
import { buildGrid } from "./board";
import { createDictionary } from "./dictionary";
import { generateMoves } from "./movegen";

function place(word: string, row: number, col: number, horizontal: boolean): BoardTileInput[] {
  return [...word].map((letter, index) => ({
    row: horizontal ? row : row + index,
    col: horizontal ? col + index : col,
    letter,
  }));
}

function move(overrides: Partial<Move>): Move {
  return {
    word: "AB",
    row: 7,
    col: 7,
    direction: "horizontal",
    tiles: [],
    bingo: false,
    bingoBonus: 0,
    score: 0,
    crosswords: [],
    ...overrides,
  };
}

describe("ordinary move detection", () => {
  it("falls back to the best play of six or fewer tiles when no bingo exists", () => {
    // Every CAT placement covering the center scores 10. The vertical play starting at row 5 has the lowest row.
    const { recommendation } = analyzeBoard([], ["C", "A", "T", "X", "Y", "Z", "Q"], createDictionary(["CAT"]));
    expect(recommendation).toMatchObject({
      word: "CAT",
      direction: "vertical",
      row: 5,
      col: 7,
      bingo: false,
      bingoBonus: 0,
      score: 10,
    });
    expect(recommendation.tiles).toHaveLength(3);
  });

  it("does not treat a five-tile play as a bingo", () => {
    const { recommendation } = analyzeBoard([], ["P", "A", "I", "N", "T", "E", "R"], createDictionary(["PAINT"]));
    expect(recommendation.word).toBe("PAINT");
    expect(recommendation.tiles).toHaveLength(5);
    expect(recommendation.bingo).toBe(false);
  });

  it("returns no recommendation when no legal play exists", () => {
    const { issues, recommendation } = analyzeBoard([], ["Q"], createDictionary(["CAT"]));
    expect(issues).toEqual([]);
    expect(recommendation).toBeNull();
  });

  it("rejects placements whose crossword is not a word", () => {
    // O directly below A would form "AO", which is not in the list, so no play may put O at (8, 6).
    const dictionary = createDictionary(["AT", "TO", "AI", "OI"]);
    const grid = buildGrid(place("AT", 7, 6, true)).grid;
    const moves = generateMoves(grid, dictionary, ["O", "I"]);
    expect(moves.some((play) => play.tiles.some(({ row, col, letter }) => row === 8 && col === 6 && letter === "O"))).toBe(false);
    expect(moves.some((play) => play.word === "OI" && play.direction === "horizontal" && play.row === 8 && play.col === 7)).toBe(true);
  });
});

describe("move selection", () => {
  it("prefers a bingo over a higher-scoring non-bingo move", () => {
    const best = selectBestMove([
      move({ word: "QUIZ", score: 90, tiles: [{ row: 7, col: 7, letter: "Q" }] }),
      move({ word: "PAINTER", score: 60, bingo: true, bingoBonus: 50, tiles: Array(7).fill({ row: 7, col: 7, letter: "P" }) }),
    ]);
    expect(best.word).toBe("PAINTER");
  });

  it("breaks equal scores by lower row, then lower column, then horizontal before vertical, then alphabetical word", () => {
    expect(selectBestMove([
      move({ word: "AAA", row: 5, col: 7, direction: "horizontal", score: 30 }),
      move({ word: "BBB", row: 4, col: 9, direction: "vertical", score: 30 }),
    ])).toMatchObject({ word: "BBB" });

    expect(selectBestMove([
      move({ word: "AAA", row: 5, col: 7, direction: "vertical", score: 30 }),
      move({ word: "BBB", row: 5, col: 7, direction: "horizontal", score: 30 }),
    ])).toMatchObject({ word: "BBB" });

    expect(selectBestMove([
      move({ word: "ZAG", row: 5, col: 7, direction: "horizontal", score: 30 }),
      move({ word: "CAT", row: 5, col: 7, direction: "horizontal", score: 30 }),
    ])).toMatchObject({ word: "CAT" });
  });
});
