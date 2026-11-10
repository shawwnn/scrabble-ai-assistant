import { useQuery } from "@tanstack/react-query";
import { requestAnalysis } from "@/lib/analyze-api";
import { DEMO_BOARD, DEMO_RACK } from "@/lib/analyzer-demo";

export function useAnalyzerSuggestions() {
  return useQuery({
    queryKey: ["analyzer", "suggestions", "demo"],
    queryFn: () => requestAnalysis({ board: DEMO_BOARD, rack: DEMO_RACK }),
    retry: false,
  });
}
