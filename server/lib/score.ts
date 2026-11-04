import type { Direction, PlacedTile } from "@shared/api";
// Relative paths: vite.config.ts loads the server before path aliases are available.
import { getPremium } from "../../shared/premiums";
import { tilePoints } from "../../shared/tiles";
import { readRun, wordOf, type Grid, type Square } from "./board";

export const RACK_SIZE = 7;
export const BINGO_BONUS = 50;

function scoreSquares(grid: Grid, squares: Square[], newKeys: Set<string>): number {
  let sum = 0;
  let wordMultiplier = 1;
  for (const { row, col } of squares) {
    const cell = grid[row][col];
    let value = cell.blank ? 0 : tilePoints[cell.letter];
    if (newKeys.has(`${row},${col}`)) {
      const premium = getPremium(row, col);
      if (premium === "dl") value *= 2;
      if (premium === "tl") value *= 3;
      if (premium === "dw" || premium === "star") wordMultiplier *= 2;
      if (premium === "tw") wordMultiplier *= 3;
    }
    sum += value;
  }
  return sum * wordMultiplier;
}

export function scoreMove(grid: Grid, tiles: PlacedTile[], direction: Direction, startRow: number, startCol: number) {
  const newKeys = new Set(tiles.map(({ row, col }) => `${row},${col}`));
  const [dr, dc] = direction === "horizontal" ? [0, 1] : [1, 0];
  let score = scoreSquares(grid, readRun(grid, startRow, startCol, dr, dc), newKeys);
  const crosswords: string[] = [];
  for (const tile of tiles) {
    const run = readRun(grid, tile.row, tile.col, dc, dr);
    if (run.length > 1) {
      crosswords.push(wordOf(grid, run));
      score += scoreSquares(grid, run, newKeys);
    }
  }
  const bingoBonus = tiles.length === RACK_SIZE ? BINGO_BONUS : 0;
  return { score: score + bingoBonus, crosswords, bingoBonus };
}
