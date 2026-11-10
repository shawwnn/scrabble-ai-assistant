import ProcessingSpinner from "@/components/analyzer/ProcessingSpinner";

export default function AnalyzerProcessing() {
  return (
    <section className="flex flex-col items-center px-2 py-10 text-center md:py-16">
      <ProcessingSpinner />
      <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Processing</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
        The screenshot is being read and the best move is being worked out.
      </p>
      <div className="mt-8 w-full max-w-md rounded-xl bg-slate-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Purpose</p>
        <p className="mt-1.5 text-sm text-slate-700">Will show progress while the analysis runs.</p>
      </div>
    </section>
  );
}
