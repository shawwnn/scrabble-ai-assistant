import { useSyncExternalStore } from "react";
import { getAnalysisResult, subscribeToSelectedScreenshot } from "@/lib/analyzer-upload-store";

export function useAnalyzerSuggestions() {
  const data = useSyncExternalStore(subscribeToSelectedScreenshot, getAnalysisResult);
  return { data, error: null, isLoading: !data };
}
