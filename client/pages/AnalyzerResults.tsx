import ProcessingSpinner from "@/components/analyzer/ProcessingSpinner";
import SuggestionList from "@/components/analyzer/SuggestionList";
import { useAnalyzerSuggestions } from "@/hooks/useAnalyzerSuggestions";

export default function AnalyzerResults() {
  const { data, error, isLoading } = useAnalyzerSuggestions();

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Step 3</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">Analysis results</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          Highest-scoring legal moves found from the uploaded Scrabble board and rack.
        </p>
      </header>

      {isLoading && (
        <div className="flex justify-center py-10">
          <ProcessingSpinner />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {data &&
        data.extracted && (
          <pre className="overflow-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-5">
            {JSON.stringify(data.extracted, null, 2)}
          </pre>
        )}

      {data &&
        (data.suggestions.length > 0 ? (
          <SuggestionList moves={data.suggestions} />
        ) : (
          <p className="text-sm text-muted-foreground">No legal moves were found for this rack.</p>
        ))}
    </section>
  );
}
