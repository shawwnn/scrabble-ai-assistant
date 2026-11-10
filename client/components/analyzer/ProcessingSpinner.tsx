export default function ProcessingSpinner() {
  return (
    <div
      role="status"
      aria-label="Processing screenshot"
      className="h-16 w-16 animate-spin rounded-full border-[5px] border-muted border-t-primary"
    />
  );
}
