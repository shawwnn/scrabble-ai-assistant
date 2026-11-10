import ProcessingProgress from "@/components/analyzer/ProcessingProgress";
import ProcessingSpinner from "@/components/analyzer/ProcessingSpinner";
import ProcessingStepper from "@/components/analyzer/ProcessingStepper";
import StageToast from "@/components/analyzer/StageToast";
import { useSimulatedProcessing } from "@/hooks/useSimulatedProcessing";
import { PROCESSING_STAGES } from "@/lib/analyzer-processing";

export default function AnalyzerProcessing() {
  const activeIndex = useSimulatedProcessing();
  const total = PROCESSING_STAGES.length;
  const percent = Math.round((Math.min(activeIndex, total) / total) * 100);

  return (
    <section className="flex flex-col items-center gap-8 px-2 py-10 text-center md:py-14">
      <ProcessingSpinner />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Processing</h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          The screenshot is being read and the best move is being worked out.
        </p>
      </div>
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 text-left shadow-sm md:p-6">
        <h2 className="mb-5 font-semibold">Processing steps</h2>
        <ProcessingStepper activeIndex={activeIndex} />
        <div className="mt-6 border-t border-border pt-5">
          <ProcessingProgress percent={percent} />
        </div>
      </div>
      {activeIndex < total && (
        <StageToast key={activeIndex} stage={PROCESSING_STAGES[activeIndex]} step={activeIndex + 1} total={total} />
      )}
    </section>
  );
}
