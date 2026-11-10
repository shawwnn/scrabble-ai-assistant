import { useRef } from "react";
import { Camera, Upload } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
}

export default function UploadDropzone({ onFileSelect }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex w-full flex-col items-center gap-4"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) onFileSelect(file);
      }}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <Upload className="h-7 w-7" strokeWidth={2.5} />
        Select Image
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFileSelect(file);
        }}
      />
      <p className="text-base text-slate-500">or drag and drop here</p>
      <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
        <Camera className="h-4 w-4" />
        Supports JPG, PNG, WEBP • Clear image for best results
      </p>
    </div>
  );
}
