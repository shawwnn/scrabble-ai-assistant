import { AlertTriangle } from "lucide-react";
import type { ImageAnalyzeErrorCode } from "@shared/api";

const messages: Record<ImageAnalyzeErrorCode, { title: string; detail: string }> = {
  OPENAI_API_ERROR: { title: "AI service unavailable", detail: "The image service could not be reached. Please try again shortly." },
  IMAGE_NOT_RECOGNIZED: { title: "Scrabble board not recognized", detail: "Use a clear image showing the full board and all seven rack tiles." },
  OCR_EXTRACTION_FAILED: { title: "Board details could not be extracted", detail: "The image was received, but the board or rack data was incomplete. Try again with a clearer image." },
};

export default function UploadErrorNotice({ code = "IMAGE_NOT_RECOGNIZED" }: { code?: ImageAnalyzeErrorCode }) {
  const message = messages[code];
  return (
    <div
      role="alert"
      className="flex w-full items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-left"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <div>
        <p className="font-semibold text-destructive">{message.title}</p>
        <p className="mt-1 text-sm text-foreground">{message.detail}</p>
      </div>
    </div>
  );
}
