import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStage, StageStatus } from "@/lib/analyzer-processing";

interface ProcessingStepItemProps {
  stage: ProcessingStage;
  index: number;
  status: StageStatus;
  isLast: boolean;
}

export default function ProcessingStepItem({ stage, index, status, isLast }: ProcessingStepItemProps) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
            status === "completed" ? "bg-primary" : "bg-border",
          )}
        />
      )}
      <StepIndicator index={index} status={status} />
      <div className="min-w-0 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-semibold", status === "pending" ? "text-muted-foreground" : "text-foreground")}>
            {stage.label}
          </p>
          {status === "completed" && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Completed</span>
          )}
          {status === "active" && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              In progress
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
      </div>
    </li>
  );
}

function StepIndicator({ index, status }: { index: number; status: StageStatus }) {
  if (status === "completed") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center">
        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-card text-sm font-semibold text-muted-foreground">
      {index + 1}
    </span>
  );
}
