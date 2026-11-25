import type { AnalyzeErrorResponse, AnalyzeResponse, ImageAnalyzeErrorCode } from "@shared/api";
import { TOTAL_PROCESSING_TIMEOUT_MS } from "@/lib/analyzer-processing";

export class ImageAnalyzeError extends Error {
  constructor(message: string, readonly code: ImageAnalyzeErrorCode) { super(message); }
}

export async function requestImageAnalysis(file: File): Promise<AnalyzeResponse> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: { mimeType: file.type, data: btoa(binary) } }),
    signal: AbortSignal.timeout(TOTAL_PROCESSING_TIMEOUT_MS),
  });
  const body = (await response.json()) as AnalyzeResponse | AnalyzeErrorResponse;
  if (!response.ok) throw new ImageAnalyzeError("error" in body ? body.error : "Image analysis failed.", "code" in body && body.code ? body.code : "OPENAI_API_ERROR");
  return body as AnalyzeResponse;
}
