import type { AnalyzeErrorResponse, AnalyzeRequest, AnalyzeResponse } from "@shared/api";

export async function requestAnalysis(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const body = (await response.json()) as AnalyzeResponse | AnalyzeErrorResponse;
  if (!response.ok) throw new Error("error" in body ? body.error : "Analysis failed.");
  return body as AnalyzeResponse;
}
