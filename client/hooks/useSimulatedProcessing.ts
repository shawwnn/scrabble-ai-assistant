import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PROCESSING_STAGES, STAGE_DURATION_MS } from "@/lib/analyzer-processing";

export function useSimulatedProcessing() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const finished = activeIndex >= PROCESSING_STAGES.length;

  useEffect(() => {
    if (finished) {
      navigate("/analyzer/results");
      return;
    }
    const timer = window.setTimeout(() => setActiveIndex((index) => index + 1), STAGE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, finished, navigate]);

  return activeIndex;
}
