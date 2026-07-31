import { Clock3, Gamepad2, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { games } from "@/lib/game-data";

export default function OngoingGames() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Your games</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Ongoing games
          </h1>
          <p className="mt-2 text-muted-foreground">Keep the momentum going.</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/new-game">
            <Plus className="mr-2 h-4 w-4" /> New game
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {games.map((game) => (
          <Link
            to={`/games/${game.id}`}
            key={game.id}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                {game.opponentInitial}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">{game.opponent}</h2>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${game.turn === "Your turn" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {game.turn}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {game.score}
                </p>
              </div>
              <span className="text-primary opacity-0 transition group-hover:opacity-100">
                →
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" /> {game.updated}
              </span>
              <span>{game.progress}% complete</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${game.progress}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <h2 className="mt-3 font-bold">Looking for a fresh challenge?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start another local match and keep your word streak alive.
        </p>
        <Button asChild variant="outline" className="mt-5 rounded-xl">
          <Link to="/new-game">Create a game</Link>
        </Button>
      </div>
    </div>
  );
}
