import type { AnalyzeResponse } from "@shared/api";

let selectedScreenshot: File | null = null;
let analysisResult: AnalyzeResponse | null = null;
let analysisError: string | null = null;
const listeners = new Set<() => void>();

export function getSelectedScreenshot(): File | null {
  return selectedScreenshot;
}

export function setSelectedScreenshot(file: File | null): void {
  selectedScreenshot = file;
  analysisResult = null;
  analysisError = null;
  listeners.forEach((listener) => listener());
}

export function getAnalysisResult(): AnalyzeResponse | null { return analysisResult; }
export function setAnalysisResult(result: AnalyzeResponse | null): void { analysisResult = result; listeners.forEach((listener) => listener()); }
export function getAnalysisError(): string | null { return analysisError; }
export function setAnalysisError(error: string | null): void { analysisError = error; listeners.forEach((listener) => listener()); }

export function subscribeToSelectedScreenshot(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
