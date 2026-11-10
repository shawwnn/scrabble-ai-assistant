interface ProcessingProgressProps {
  percent: number;
}

export default function ProcessingProgress({ percent }: ProcessingProgressProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Demo progress</span>
        <span className="text-foreground">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Demo progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
