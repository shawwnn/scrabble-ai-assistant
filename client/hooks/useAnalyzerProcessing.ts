import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageAnalyzeError, requestImageAnalysis } from "@/lib/image-analyze-api";
import { getSelectedScreenshot, setAnalysisError, setAnalysisResult } from "@/lib/analyzer-upload-store";
import { PROCESSING_STAGES, STAGE_DURATION_MS } from "@/lib/analyzer-processing";

export function useAnalyzerProcessing() {
  const navigate = useNavigate();
  const started = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const file = getSelectedScreenshot();
    if (!file) { navigate("/analyzer/upload", { replace: true }); return; }
    if (started.current) return;
    started.current = true;
    const stageTimer = window.setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, PROCESSING_STAGES.length - 1));
    }, STAGE_DURATION_MS);
    requestImageAnalysis(file)
      .then((result) => { window.clearInterval(stageTimer); setActiveIndex(5); setAnalysisResult(result); navigate("/analyzer/results", { replace: true }); })
      .catch((error: unknown) => { window.clearInterval(stageTimer); setAnalysisError(error instanceof Error ? error.message : "Image analysis failed.", error instanceof ImageAnalyzeError ? error.code : "GEMINI_API_ERROR"); navigate("/analyzer/error", { replace: true }); });
    return () => window.clearInterval(stageTimer);
  }, [navigate]);

  return activeIndex;
}
