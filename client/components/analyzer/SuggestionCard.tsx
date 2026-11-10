import type { Move } from "@shared/api";
import { DEMO_RACK } from "@/lib/analyzer-demo";

interface SuggestionCardProps {
  move: Move;
  rank: number;
  highlighted: boolean;
}

function usageLabel(move: Move) {
  return `${move.tiles.length} of ${DEMO_RACK.length} tiles`;
}

function noteLabel(move: Move) {
  if (move.bingo) return `Bingo, includes ${move.bingoBonus}-point bonus`;
  if (move.crosswords.length) return `Cross-words: ${move.crosswords.join(", ")}`;
  return "No cross-words";
}

export default function SuggestionCard({ move, rank, highlighted }: SuggestionCardProps) {
  return (
    <div className={`w-full rounded-xl border p-3 ${highlighted ? "border-primary/30 bg-primary/5" : "border-border"}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded bg-primary text-xs font-bold text-primary-foreground">{rank}</span>
        <strong className="flex-1">{move.word}</strong>
        <span className="font-bold text-primary">{move.score} pts</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {usageLabel(move)} · {noteLabel(move)}
      </p>
    </div>
  );
}
