import { Camera, Upload } from "lucide-react";

export default function UploadDropzone() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <button
        type="button"
        className="flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <Upload className="h-7 w-7" strokeWidth={2.5} />
        Select Image
      </button>
      <p className="text-base text-slate-500">or drag and drop here</p>
      <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
        <Camera className="h-4 w-4" />
        Supports JPG, PNG, WEBP • Clear image for best results
      </p>
    </div>
  );
}
