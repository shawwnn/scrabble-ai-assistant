import type { AnalyzeResponse, ImageAnalyzeErrorCode } from "@shared/api";

let selectedScreenshot: File | null = null;
let analysisResult: AnalyzeResponse | null = null;
let analysisError: string | null = null;
let analysisErrorCode: ImageAnalyzeErrorCode = "IMAGE_NOT_RECOGNIZED";
const listeners = new Set<() => void>();

export function getSelectedScreenshot(): File | null {
  return selectedScreenshot;
}

export function setSelectedScreenshot(file: File | null): void {
  selectedScreenshot = file;
  analysisResult = null;
  analysisError = null;
  analysisErrorCode = "IMAGE_NOT_RECOGNIZED";
  listeners.forEach((listener) => listener());
}

export function getAnalysisResult(): AnalyzeResponse | null { return analysisResult; }
export function setAnalysisResult(result: AnalyzeResponse | null): void { analysisResult = result; listeners.forEach((listener) => listener()); }
export function getAnalysisError(): string | null { return analysisError; }
export function getAnalysisErrorCode(): ImageAnalyzeErrorCode { return analysisErrorCode; }
export function setAnalysisError(error: string | null, code: ImageAnalyzeErrorCode = "IMAGE_NOT_RECOGNIZED"): void { analysisError = error; analysisErrorCode = code; listeners.forEach((listener) => listener()); }

export function subscribeToSelectedScreenshot(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
