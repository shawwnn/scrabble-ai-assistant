import type { Move } from "@shared/api";
import SuggestionCard from "@/components/analyzer/SuggestionCard";

interface SuggestionListProps {
  moves: Move[];
}

export default function SuggestionList({ moves }: SuggestionListProps) {
  return (
    <div className="space-y-2">
      {moves.map((move, index) => (
        <SuggestionCard
          key={`${move.word}-${move.row}-${move.col}-${move.direction}`}
          move={move}
          rank={index + 1}
          highlighted={index === 0}
        />
      ))}
    </div>
  );
}
