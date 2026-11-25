import { describe, expect, it } from "vitest";
import { BOARD_DIMENSION, RACK_DIMENSION, getBoardCell, getBoardLayout, getRackTile } from "./browser-board-layout";

describe("browser board layout", () => {
  it("creates a 15 by 15 board layout", () => {
    const layout = getBoardLayout(1060, 1280);
    expect(layout.cellSize).toBeCloseTo(layout.size / BOARD_DIMENSION);
    expect(getBoardCell(layout, 0, 0).x).toBeGreaterThan(layout.x);
    expect(getBoardCell(layout, 14, 14).x).toBeLessThan(layout.x + layout.size);
  });

  it("creates seven rack regions", () => {
    const regions = Array.from({ length: RACK_DIMENSION }, (_, index) => getRackTile(1060, 1280, index));
    expect(regions).toHaveLength(7);
    expect(regions[0].x).toBeLessThan(regions[6].x);
    expect(regions[6].x + regions[6].width).toBeLessThanOrEqual(1060);
  });
});
