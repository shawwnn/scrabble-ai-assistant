import { describe, expect, it } from "vitest";
import { boardExtractionSchema } from "../../../shared/image-extraction";
import fixtures from "./expected.json";

describe("vision fixture annotations", () => {
  it.each(Object.entries(fixtures))("has a valid 15×15 board and rack for %s", (_name, fixture) => {
    expect(fixture.rows).toHaveLength(15);
    expect(fixture.rows.every((row) => /^[A-Z.]{15}$/.test(row))).toBe(true);
    const board = fixture.rows.flatMap((row, rowIndex) => [...row].flatMap((letter, col) => letter === "." ? [] : [{ row: rowIndex, col, letter }]));
    expect(boardExtractionSchema.safeParse({ board, rack: [...fixture.rack] }).success).toBe(true);
  });
});
