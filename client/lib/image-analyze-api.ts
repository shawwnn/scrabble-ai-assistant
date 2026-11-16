import type { AnalyzeErrorResponse, AnalyzeResponse } from "@shared/api";

export async function requestImageAnalysis(file: File): Promise<AnalyzeResponse> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: { mimeType: file.type, data: btoa(binary) } }),
  });
  const body = (await response.json()) as AnalyzeResponse | AnalyzeErrorResponse;
  if (!response.ok) throw new Error("error" in body ? body.error : "Image analysis failed.");
  return body as AnalyzeResponse;
}
