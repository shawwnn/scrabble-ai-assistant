import { describe, expect, it } from "vitest";
import { buildGrid } from "./board";

describe("buildGrid validation", () => {
  it("accepts an empty board", () => {
    expect(buildGrid([]).issues).toEqual([]);
  });

  it("accepts a connected board that covers the center", () => {
    const { issues } = buildGrid([
      { row: 7, col: 7, letter: "E" },
      { row: 7, col: 8, letter: "R" },
    ]);
    expect(issues).toEqual([]);
  });

  it("rejects tiles outside the board", () => {
    const { issues } = buildGrid([{ row: 15, col: 0, letter: "A" }]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("outside");
  });

  it("rejects two tiles on the same square", () => {
    const { issues } = buildGrid([
      { row: 7, col: 7, letter: "E" },
      { row: 7, col: 7, letter: "R" },
    ]);
    expect(issues[0]).toContain("More than one tile");
  });

  it("requires a non-empty board to cover the center", () => {
    const { issues } = buildGrid([{ row: 0, col: 0, letter: "A" }]);
    expect(issues[0]).toContain("center");
  });

  it("requires board tiles to form one connected group", () => {
    const { issues } = buildGrid([
      { row: 7, col: 7, letter: "E" },
      { row: 7, col: 9, letter: "A" },
    ]);
    expect(issues[0]).toContain("connected");
  });
});
