import { describe, expect, test } from "vitest";
import { scoreMove } from "../src/game/scoring.js";

const pendingTile = (key: string, letter: string) => ({
  key,
  letter,
  tile: { pending: true },
});

const boardTile = (key: string, letter: string) => ({
  key,
  letter,
  tile: { pending: false },
});

describe("scoreMove premium squares", () => {
  test("doubles a newly placed letter on a double-letter square", () => {
    const result = scoreMove([
      {
        word: "QA",
        positions: ["0,3", "0,4"],
        tiles: [pendingTile("0,3", "Q"), pendingTile("0,4", "A")],
      },
    ]);

    expect(result.words[0]?.score).toBe(21);
    expect(result.totalProjectedScore).toBe(21);
  });

  test("triples the word when a newly placed tile lands on a triple-word square", () => {
    const result = scoreMove([
      {
        word: "CAT",
        positions: ["0,0", "0,1", "0,2"],
        tiles: [pendingTile("0,0", "C"), pendingTile("0,1", "A"), pendingTile("0,2", "T")],
      },
    ]);

    expect(result.words[0]?.score).toBe(15);
  });

  test("ignores premium squares under tiles already on the board", () => {
    const result = scoreMove([
      {
        word: "QA",
        positions: ["0,3", "0,4"],
        tiles: [boardTile("0,3", "Q"), pendingTile("0,4", "A")],
      },
    ]);

    expect(result.words[0]?.score).toBe(11);
  });
});
