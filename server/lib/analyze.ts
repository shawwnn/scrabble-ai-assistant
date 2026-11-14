import type { BoardTileInput, Move, MoveRecommendation } from "@shared/api";
import { BOARD_SIZE, buildGrid, inBounds, readRun, wordOf, type Grid } from "./board";
import type { Dictionary } from "./dictionary";
import { generateMoves } from "./movegen";
import { BINGO_BONUS, RACK_SIZE } from "./score";

const SUGGESTION_COUNT = 5;

export interface AnalysisResult {
  issues: string[];
  recommendation: MoveRecommendation | null;
  suggestions: Move[];
}

export function analyzeBoard(tiles: BoardTileInput[], rack: string[], dictionary: Dictionary): AnalysisResult {
  const { grid, issues } = buildGrid(tiles);
  if (issues.length > 0) return { issues, recommendation: null, suggestions: [] };

  const invalidWords = findInvalidBoardWords(grid, dictionary);
  if (invalidWords.length > 0) {
    return {
      issues: invalidWords.map((word) => `"${word}" on the board is not in the word list.`),
      recommendation: null,
      suggestions: [],
    };
  }

  const suggestions = rankMoves(generateMoves(grid, dictionary, rack.map((letter) => letter.toUpperCase())), SUGGESTION_COUNT);
  const [best] = suggestions;
  if (!best) return { issues: [], recommendation: null, suggestions: [] };
  return { issues: [], recommendation: { ...best, explanation: explain(best, rack.length) }, suggestions };
}

export function selectBestMove(moves: Move[]): Move | null {
  return rankMoves(moves, 1)[0] ?? null;
}

function rankMoves(moves: Move[], limit: number): Move[] {
  return [...moves].sort(compareMoves).slice(0, limit);
}

function compareMoves(a: Move, b: Move): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.row !== b.row) return a.row - b.row;
  if (a.col !== b.col) return a.col - b.col;
  if (a.direction !== b.direction) return a.direction === "horizontal" ? -1 : 1;
  if (a.word === b.word) return 0;
  return a.word < b.word ? -1 : 1;
}

function findInvalidBoardWords(grid: Grid, dictionary: Dictionary): string[] {
  const invalid = new Set<string>();
  for (const [dr, dc] of [[0, 1], [1, 0]]) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const isRunStart = !(inBounds(row - dr, col - dc) && grid[row - dr][col - dc]);
        if (!grid[row][col] || !isRunStart) continue;
        const run = readRun(grid, row, col, dr, dc);
        if (run.length < 2) continue;
        const word = wordOf(grid, run);
        if (!dictionary.isWord(word)) invalid.add(word);
      }
    }
  }
  return [...invalid];
}

function explain(move: Move, rackSize: number): string {
  if (move.bingo) {
    return `Uses all ${RACK_SIZE} rack tiles for a bingo, including the ${BINGO_BONUS}-point bonus.`;
  }
  return `No bingo is available. This is the highest-scoring legal play, using ${move.tiles.length} of ${rackSize} tiles.`;
}
