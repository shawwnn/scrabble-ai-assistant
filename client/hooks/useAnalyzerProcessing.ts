import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAnalysis } from "@/lib/analyze-api";
import { extractBoardFromImage } from "@/lib/browser-board-extractor";
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
    extractBoardFromImage(file)
      .then((extracted) => requestAnalysis({ board: extracted.board, rack: extracted.rack }).then((result) => ({ ...result, extracted })))
      .then((result) => { window.clearInterval(stageTimer); setActiveIndex(5); setAnalysisResult(result); navigate("/analyzer/results", { replace: true }); })
      .catch((error: unknown) => { window.clearInterval(stageTimer); setAnalysisError(error instanceof Error ? error.message : "Image extraction failed.", "OCR_EXTRACTION_FAILED"); navigate("/analyzer/error", { replace: true }); });
    return () => window.clearInterval(stageTimer);
  }, [navigate]);

  return activeIndex;
}
