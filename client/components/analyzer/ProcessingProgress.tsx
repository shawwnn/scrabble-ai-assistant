export default function ProcessingProgress() {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Backend processing</span>
        <span className="text-foreground">In progress</span>
      </div>
      <div
        role="progressbar"
        aria-label="Backend processing in progress"
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}
