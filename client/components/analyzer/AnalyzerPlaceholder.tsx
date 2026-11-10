interface AnalyzerPlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  purpose: string;
}

export default function AnalyzerPlaceholder({ eyebrow, title, description, purpose }: AnalyzerPlaceholderProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
      <div className="mt-6 rounded-xl bg-muted/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purpose</p>
        <p className="mt-1.5 text-sm">{purpose}</p>
      </div>
    </section>
  );
}
