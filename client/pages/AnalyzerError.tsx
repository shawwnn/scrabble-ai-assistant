import { Link } from "react-router-dom";
import UploadErrorNotice from "@/components/analyzer/UploadErrorNotice";

export default function AnalyzerError() {
  return (
    <section className="flex flex-col items-center gap-8 px-2 py-10 text-center md:py-14">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Extraction Failed</h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          The image could not be read. Try again with a clearer screenshot.
        </p>
      </div>
      <div className="w-full max-w-xl">
        <UploadErrorNotice />
      </div>
      <Link
        to="/analyzer/upload"
        className="rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
      >
        Try again
      </Link>
    </section>
  );
}
