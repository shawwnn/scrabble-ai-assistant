import { useRef, useState } from "react";
import ScreenshotPreview from "@/components/analyzer/ScreenshotPreview";
import UploadPrompt from "@/components/analyzer/UploadPrompt";
import { ACCEPT_ATTRIBUTE } from "@/lib/analyzer-upload";

interface UploadDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export default function UploadDropzone({ file, previewUrl, onFileSelect, onRemove }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = () => inputRef.current?.click();

  return (
    <div
      className={`flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-6 transition-colors md:p-8 ${
        isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const dropped = event.dataTransfer.files[0];
        if (dropped) onFileSelect(dropped);
      }}
    >
      {file ? (
        <ScreenshotPreview file={file} previewUrl={previewUrl} onReplace={openFilePicker} onRemove={onRemove} />
      ) : (
        <UploadPrompt onBrowse={openFilePicker} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          if (selected) onFileSelect(selected);
        }}
      />
    </div>
  );
}
