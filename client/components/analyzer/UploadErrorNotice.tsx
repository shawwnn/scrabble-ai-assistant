import { AlertTriangle } from "lucide-react";

export default function UploadErrorNotice() {
  return (
    <div
      role="alert"
      className="flex w-full items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-left"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <div>
        <p className="font-semibold text-destructive">We couldn't read this image</p>
        <p className="mt-1 text-sm text-foreground">Upload a clearer board and 7 present rack.</p>
      </div>
    </div>
  );
}
