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

export async function validateMoveBackend(data: {
  board: Record<string, unknown>;
  pending: Record<string, unknown>;
}) {
  const response = await fetch("http://localhost:3000/api/validate-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return response.json();
}
