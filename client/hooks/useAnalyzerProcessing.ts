import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestImageAnalysis } from "@/lib/image-analyze-api";
import { getSelectedScreenshot, setAnalysisError, setAnalysisResult } from "@/lib/analyzer-upload-store";

export function useAnalyzerProcessing() {
  const navigate = useNavigate();
  const started = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const file = getSelectedScreenshot();
    if (!file) { navigate("/analyzer/upload", { replace: true }); return; }
    if (started.current) return;
    started.current = true;
    setActiveIndex(1);
    requestImageAnalysis(file)
      .then((result) => { setActiveIndex(5); setAnalysisResult(result); navigate("/analyzer/results", { replace: true }); })
      .catch((error: unknown) => { setAnalysisError(error instanceof Error ? error.message : "Image analysis failed."); navigate("/analyzer/error", { replace: true }); });
  }, [navigate]);

  return activeIndex;
}
