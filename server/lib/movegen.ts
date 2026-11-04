import type { Direction, Move, PlacedTile } from "@shared/api";
import { BOARD_SIZE, CENTER, inBounds, type Grid } from "./board";
import type { Dictionary, TrieNode } from "./dictionary";
import { RACK_SIZE, scoreMove } from "./score";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ANY_LETTER = (1 << LETTERS.length) - 1;
const STEPS: Record<Direction, [number, number]> = {
  horizontal: [0, 1],
  vertical: [1, 0],
};

export function generateMoves(grid: Grid, dictionary: Dictionary, rack: string[]): Move[] {
  const rackCounts = Array<number>(LETTERS.length).fill(0);
  for (const letter of rack) rackCounts[LETTERS.indexOf(letter)] += 1;
  const boardHasTiles = grid.some((cells) => cells.some(Boolean));
  const moves: Move[] = [];
  for (const direction of ["horizontal", "vertical"] as const) {
    searchDirection(grid, dictionary, rackCounts, direction, boardHasTiles, moves);
  }
  return moves;
}

function searchDirection(
  grid: Grid,
  dictionary: Dictionary,
  rackCounts: number[],
  direction: Direction,
  boardHasTiles: boolean,
  moves: Move[],
) {
  const [dr, dc] = STEPS[direction];
  const crossMasks = computeCrossMasks(grid, dictionary, dc, dr);
  const placed: PlacedTile[] = [];
  let startRow = 0;
  let startCol = 0;

  const recordIfLegal = (word: string) => {
    const coversCenter = placed.some(({ row, col }) => row === CENTER && col === CENTER);
    if (!boardHasTiles && !coversCenter) return;
    if (boardHasTiles && !connectsToBoard(grid, placed, word.length, dr, dc)) return;
    const { score, crosswords, bingoBonus } = scoreMove(grid, placed, direction, startRow, startCol);
    moves.push({
      word,
      row: startRow,
      col: startCol,
      direction,
      tiles: placed.map((tile) => ({ ...tile })),
      bingo: placed.length === RACK_SIZE,
      bingoBonus,
      score,
      crosswords,
    });
  };

  const extend = (row: number, col: number, node: TrieNode, word: string) => {
    if (inBounds(row, col) && grid[row][col]) {
      const { letter } = grid[row][col];
      const child = node.children.get(letter);
      if (child) extend(row + dr, col + dc, child, word + letter);
      return;
    }
    if (placed.length > 0 && node.terminal && word.length >= 2) recordIfLegal(word);
    if (!inBounds(row, col)) return;
    const mask = crossMasks[row][col];
    for (let i = 0; i < LETTERS.length; i += 1) {
      if (rackCounts[i] === 0 || (mask & (1 << i)) === 0) continue;
      const letter = LETTERS[i];
      const child = node.children.get(letter);
      if (!child) continue;
      rackCounts[i] -= 1;
      grid[row][col] = { letter, blank: false };
      placed.push({ row, col, letter });
      extend(row + dr, col + dc, child, word + letter);
      placed.pop();
      grid[row][col] = null;
      rackCounts[i] += 1;
    }
  };

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (inBounds(row - dr, col - dc) && grid[row - dr][col - dc]) continue;
      startRow = row;
      startCol = col;
      extend(row, col, dictionary.root, "");
    }
  }
}

function connectsToBoard(grid: Grid, placed: PlacedTile[], wordLength: number, dr: number, dc: number): boolean {
  if (wordLength > placed.length) return true;
  return placed.some(({ row, col }) => isOccupied(grid, row + dc, col + dr) || isOccupied(grid, row - dc, col - dr));
}

function isOccupied(grid: Grid, row: number, col: number): boolean {
  return inBounds(row, col) && grid[row][col] !== null;
}

function computeCrossMasks(grid: Grid, dictionary: Dictionary, pr: number, pc: number): number[][] {
  return grid.map((cells, row) =>
    cells.map((cell, col) => (cell ? 0 : crossMaskAt(grid, dictionary, row, col, pr, pc))),
  );
}

function crossMaskAt(grid: Grid, dictionary: Dictionary, row: number, col: number, pr: number, pc: number): number {
  let before = "";
  for (let r = row - pr, c = col - pc; inBounds(r, c) && grid[r][c]; r -= pr, c -= pc) {
    before = grid[r][c].letter + before;
  }
  let after = "";
  for (let r = row + pr, c = col + pc; inBounds(r, c) && grid[r][c]; r += pr, c += pc) {
    after += grid[r][c].letter;
  }
  if (!before && !after) return ANY_LETTER;
  let mask = 0;
  for (let i = 0; i < LETTERS.length; i += 1) {
    if (dictionary.isWord(before + LETTERS[i] + after)) mask |= 1 << i;
  }
  return mask;
}
