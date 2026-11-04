import type { BoardTileInput } from "@shared/api";

export const BOARD_SIZE = 15;
export const CENTER = 7;

export type Cell = { letter: string; blank: boolean };
export type Grid = (Cell | null)[][];
export type Square = { row: number; col: number };

const NEIGHBOR_STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function createGrid(): Grid {
  return Array.from({ length: BOARD_SIZE }, () => Array<Cell | null>(BOARD_SIZE).fill(null));
}

export function buildGrid(tiles: BoardTileInput[]): { grid: Grid; issues: string[] } {
  const grid = createGrid();
  const issues: string[] = [];
  for (const tile of tiles) {
    const { row, col } = tile;
    if (!inBounds(row, col)) {
      issues.push(`Tile ${tile.letter} is outside the board at (${row}, ${col}).`);
    } else if (grid[row][col]) {
      issues.push(`More than one tile is placed at (${row}, ${col}).`);
    } else {
      grid[row][col] = { letter: tile.letter.toUpperCase(), blank: tile.blank ?? false };
    }
  }
  if (issues.length === 0 && tiles.length > 0) {
    if (!grid[CENTER][CENTER]) {
      issues.push("A board with tiles must cover the center square (7, 7).");
    } else if (!isConnected(grid)) {
      issues.push("Board tiles must form one connected group.");
    }
  }
  return { grid, issues };
}

export function readRun(grid: Grid, row: number, col: number, dr: number, dc: number): Square[] {
  let r = row;
  let c = col;
  while (inBounds(r - dr, c - dc) && grid[r - dr][c - dc]) {
    r -= dr;
    c -= dc;
  }
  const squares: Square[] = [];
  while (inBounds(r, c) && grid[r][c]) {
    squares.push({ row: r, col: c });
    r += dr;
    c += dc;
  }
  return squares;
}

export function wordOf(grid: Grid, squares: Square[]): string {
  return squares.map(({ row, col }) => grid[row][col].letter).join("");
}

function isConnected(grid: Grid): boolean {
  const occupiedCount = grid.flat().filter(Boolean).length;
  const seen = new Set<string>([`${CENTER},${CENTER}`]);
  const stack: Square[] = [{ row: CENTER, col: CENTER }];
  while (stack.length > 0) {
    const { row, col } = stack.pop();
    for (const [dr, dc] of NEIGHBOR_STEPS) {
      const r = row + dr;
      const c = col + dc;
      const key = `${r},${c}`;
      if (inBounds(r, c) && grid[r][c] && !seen.has(key)) {
        seen.add(key);
        stack.push({ row: r, col: c });
      }
    }
  }
  return seen.size === occupiedCount;
}
