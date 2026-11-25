import { describe, expect, it } from "vitest";
import { boardExtractionSchema } from "./image-extraction";

describe("board extraction contract", () => {
  it("accepts a blank rack tile", () => {
    expect(boardExtractionSchema.parse({ board: [], rack: ["E", "?"] }).rack).toEqual(["E", "?"]);
  });
  it("normalizes valid letters and coordinates", () => {
    expect(boardExtractionSchema.parse({
      board: [{ row: 7, col: 7, letter: "a" }],
      rack: ["e", "R"],
    })).toEqual({ board: [{ row: 7, col: 7, letter: "A" }], rack: ["E", "R"] });
  });

  it("rejects invalid coordinates and duplicate positions", () => {
    expect(boardExtractionSchema.safeParse({
      board: [{ row: 15, col: 0, letter: "A" }, { row: 0, col: 0, letter: "B" }, { row: 0, col: 0, letter: "C" }],
      rack: [],
    }).success).toBe(false);
  });

  it("rejects more than seven rack letters", () => {
    expect(boardExtractionSchema.safeParse({ board: [], rack: ["A", "B", "C", "D", "E", "F", "G", "H"] }).success).toBe(false);
  });
});
