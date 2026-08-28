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

const API_URL = import.meta.env.VITE_API_URL;

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
