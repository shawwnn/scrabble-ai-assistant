//backend/src/game/scoring.ts

import { getPremium } from "./rules.js";

type CurrentMoveTile = {
  key: string;
  letter: string;
  tile: Record<string, unknown>;
};

type FormedWord = {
  word: string;
  positions: string[];
  tiles: CurrentMoveTile[];
};

type WordScore = {
  word: string;
  score: number;
};

export type ScoreResult = {
  totalProjectedScore: number;
  words: WordScore[];
  bingo: boolean;
};

const TILE_POINTS: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

/**
 * Return the point value of a tile.
 *
 * Important:
 * A blank/wildcard is always worth 0 points,
 * even if its represented letter is B, Q, Z, etc.
 */
function getTilePoints(tile: CurrentMoveTile): number {
  if (tile.tile["wildcard"] === true || tile.tile["isBlank"] === true) {
    return 0;
  }

  return TILE_POINTS[tile.letter.toUpperCase()] ?? 0;
}
/**
 * A pending tile is a tile placed during the current move.
 *
 * Only pending tiles can activate premium squares.
 */
function isPending(tile: CurrentMoveTile): boolean {
  return tile.tile["pending"] === true;
}

function scoreWord(formedWord: FormedWord): number {
  let wordScore = 0;
  let wordMultiplier = 1;

  for (const tile of formedWord.tiles) {
    // console.log("SCORING TILE: in scoring.ts", tile);
    let tileScore = getTilePoints(tile);

    // Premium squares only apply to tiles
    // newly placed during this move.
    if (isPending(tile)) {
      const [row, col] = tile.key.split(",").map(Number) as [number, number];
      const premium = getPremium(row, col);

      switch (premium) {
        case "dl":
          tileScore *= 2;
          break;

        case "tl":
          tileScore *= 3;
          break;

        case "dw":
          wordMultiplier *= 2;
          break;

        case "tw":
          wordMultiplier *= 3;
          break;
      }
    }

    wordScore += tileScore;
  }

  return wordScore * wordMultiplier;
}

export function scoreMove(formedWords: FormedWord[]): ScoreResult {
  const words: WordScore[] = formedWords.map((formedWord) => ({
    word: formedWord.word,
    score: scoreWord(formedWord),
  }));

  const totalWordScore = words.reduce((total, word) => total + word.score, 0);

  /**
   * Count unique tiles placed during this move.
   *
   * We use the tile key rather than counting tiles inside
   * formed words because the same newly placed tile can
   * participate in multiple words.
   */
  const pendingKeys = new Set<string>();

  for (const formedWord of formedWords) {
    for (const tile of formedWord.tiles) {
      if (isPending(tile)) {
        pendingKeys.add(tile.key);
      }
    }
  }

  const bingo = pendingKeys.size === 7;

  const totalProjectedScore = bingo ? totalWordScore + 50 : totalWordScore;

  return {
    totalProjectedScore,
    words,
    bingo,
  };
}
