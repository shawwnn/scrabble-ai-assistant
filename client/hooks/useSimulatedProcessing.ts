import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PROCESSING_STAGES, STAGE_DURATION_MS } from "@/lib/analyzer-processing";

const FAILURE_CHANCE = 1 / 6;

function rollFailureStage(): number | null {
  if (Math.random() >= FAILURE_CHANCE) return null;
  return Math.floor(Math.random() * (PROCESSING_STAGES.length - 1));
}

export function useSimulatedProcessing() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [failureStage] = useState(rollFailureStage);
  const finished = activeIndex >= PROCESSING_STAGES.length;
  const failing = failureStage === activeIndex;

  useEffect(() => {
    if (finished) {
      navigate("/analyzer/results");
      return;
    }
    const timer = window.setTimeout(() => {
      if (failing) {
        navigate("/analyzer/error");
        return;
      }
      setActiveIndex((index) => index + 1);
    }, STAGE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, failing, finished, navigate]);

  return activeIndex;
}
