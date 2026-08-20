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

// 2. new way of validating
type CurrentMoveTile = {
  key: string;
  letter: string;
  tile: Record<string, unknown>;
};

export async function validateMoveBackend(currentMoveTiles: CurrentMoveTile[]) {
  const response = await fetch("http://localhost:3000/api/validate-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentMoveTiles }),
  });

  return response.json();
}
// 2. new way of validating
