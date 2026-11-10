import { useEffect, useState } from "react";
import type { ProcessingStage } from "@/lib/analyzer-processing";

const TOAST_DURATION_MS = 2000;

interface StageToastProps {
  stage: ProcessingStage;
  step: number;
  total: number;
}

export default function StageToast({ stage, step, total }: StageToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-border bg-card p-4 text-left shadow-lg animate-in fade-in slide-in-from-bottom-2 md:left-auto md:right-6 md:translate-x-0"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Step {step} of {total}
      </p>
      <p className="mt-1 font-semibold text-foreground">{stage.label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
    </div>
  );
}
