import ScrabbleTileLogo from "@/components/analyzer/ScrabbleTileLogo";
import UploadDropzone from "@/components/analyzer/UploadDropzone";

export default function AnalyzerUpload() {
  return (
    <section className="flex flex-col items-center px-2 py-6 text-center md:py-10">
      <ScrabbleTileLogo />
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        Upload Scrabble Board
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-7 text-slate-600 md:text-xl">
        Upload a photo or screenshot of your Scrabble game for AI analysis and find the best move.
      </p>
      <div className="mt-10 w-full">
        <UploadDropzone />
      </div>
    </section>
  );
}
