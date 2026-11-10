// frontend-web/shared/api.ts

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

////

const API_URL = import.meta.env.VITE_API_URL ?? "";

export type PersistedTile = {
  id: string;
  letter: string;
  points: number;
  wildcard?: boolean;
};

export type PersistedBoardTile = Omit<PersistedTile, "id"> & {
  tileId?: string;
};

export type GamePlayer = {
  id: string;
  name: string;
  score: number;
  rack: PersistedTile[];
  turnOrder: number;
};

export type GameTurn = {
  id: string;
  playerId: string;
  playerName: string;
  turnNumber: number;
  move: unknown;
  words: string[];
  score: number;
  createdAt: string;
};

export type GameDetail = {
  id: string;
  status: string;
  dictionary: string;
  currentPlayerId: string | null;
  board: Record<string, PersistedBoardTile>;
  bagCount: number;
  players: GamePlayer[];
  turns: GameTurn[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "The game request failed.");
  }
  return response.json() as Promise<T>;
}

export function getGame(gameId: string) {
  return request<GameDetail>(`/api/games/${gameId}`);
}

export type MovePlacement = {
  row: number;
  col: number;
  tileId: string;
  letter: string;
};

export function submitGameMove(
  gameId: string,
  playerId: string,
  placements: MovePlacement[],
) {
  return request<GameDetail>(`/api/games/${gameId}/moves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, placements }),
  });
}

// 2. new way of validating
type CurrentMoveTile = {
  key: string;
  letter: string;
  tile: Record<string, unknown>;
};

export async function validateMoveBackend(currentMoveTiles: CurrentMoveTile[]) {
  const response = await fetch(`${API_URL}/api/validate-move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentMoveTiles }),
  });

  return response.json();
}
// 2. new way of validating
