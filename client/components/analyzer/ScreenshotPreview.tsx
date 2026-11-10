import { RefreshCw, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/analyzer-upload";

interface ScreenshotPreviewProps {
  file: File;
  previewUrl: string | null;
  onReplace: () => void;
  onRemove: () => void;
}

export default function ScreenshotPreview({ file, previewUrl, onReplace, onRemove }: ScreenshotPreviewProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex min-h-48 items-center justify-center rounded-xl bg-slate-100 p-3">
        {previewUrl && (
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            className="max-h-96 w-auto max-w-full rounded-lg object-contain"
          />
        )}
      </div>
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="min-w-0 text-left">
          <p className="truncate font-semibold text-slate-900" title={file.name}>
            {file.name}
          </p>
          <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onReplace}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <RefreshCw className="h-4 w-4" />
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-card px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
