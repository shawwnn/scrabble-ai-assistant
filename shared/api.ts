/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export const DICTIONARY_NAMES = ["CSW2024", "NWL2023"] as const;
export type DictionaryName = (typeof DICTIONARY_NAMES)[number];

export type Direction = "horizontal" | "vertical";

export interface BoardTileInput {
  row: number;
  col: number;
  letter: string;
  blank?: boolean;
}

export interface AnalyzeRequest {
  board: BoardTileInput[];
  rack: string[];
  dictionary?: DictionaryName;
}

/** Rows and columns are 0-based; (7, 7) is the center square. */
export interface PlacedTile {
  row: number;
  col: number;
  letter: string;
}

export interface Move {
  word: string;
  row: number;
  col: number;
  direction: Direction;
  tiles: PlacedTile[];
  bingo: boolean;
  bingoBonus: number;
  score: number;
  crosswords: string[];
}

export interface MoveRecommendation extends Move {
  explanation: string;
}

export interface AnalyzeResponse {
  dictionary: DictionaryName;
  recommendation: MoveRecommendation | null;
}

export interface AnalyzeErrorResponse {
  error: string;
  issues?: string[];
}
