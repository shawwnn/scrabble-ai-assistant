import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import ScrabbleTileLogo from "@/components/analyzer/ScrabbleTileLogo";
import UploadDropzone from "@/components/analyzer/UploadDropzone";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { validateScreenshot } from "@/lib/analyzer-upload";
import {
  getSelectedScreenshot,
  setSelectedScreenshot,
  subscribeToSelectedScreenshot,
} from "@/lib/analyzer-upload-store";

export default function AnalyzerUpload() {
  const navigate = useNavigate();
  const selectedFile = useSyncExternalStore(subscribeToSelectedScreenshot, getSelectedScreenshot);
  const previewUrl = useObjectUrl(selectedFile);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    const message = validateScreenshot(file);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setSelectedScreenshot(file);
    navigate("/analyzer/processing");
  };

  const handleRemove = () => {
    setError(null);
    setSelectedScreenshot(null);
  };

  return (
    <section className="flex flex-col items-center px-2 py-6 text-center md:py-10">
      <ScrabbleTileLogo />
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        Upload Scrabble Board
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-7 text-slate-600 md:text-xl">
        Upload a photo or screenshot of your Scrabble game for AI analysis and find the best move.
      </p>
      <div className="mt-10 flex w-full flex-col items-center gap-6">
        <UploadDropzone
          file={selectedFile}
          previewUrl={previewUrl}
          onFileSelect={handleFileSelect}
          onRemove={handleRemove}
        />
        {error && (
          <p
            role="alert"
            className="w-full max-w-2xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-left text-sm font-medium text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
