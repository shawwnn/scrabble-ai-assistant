import type { ReactNode } from "react";
import { ArrowRight, Clock3, Gamepad2, History, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { games, recentGames } from "@/lib/game-data";

export default function Index() {
  const activeGame = games[0];
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-sidebar p-6 text-sidebar-foreground shadow-xl shadow-slate-900/10 md:p-9">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-sidebar-accent px-3 py-1.5 text-xs font-bold text-sidebar-primary"><Sparkles className="h-3.5 w-3.5" /> AI-powered word play</div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Make your next move count.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-sidebar-foreground/65 md:text-base">Play classic Scrabble, keep your matches organized, and get thoughtful move suggestions when you need them.</p>
          </div>
          <Button asChild className="w-full rounded-xl bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 sm:w-auto"><Link to={`/games/${activeGame.id}`}>Continue playing <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Gamepad2 className="h-5 w-5" />} label="Active games" value="3" />
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Games won" value="16" />
        <StatCard icon={<History className="h-5 w-5" />} label="Average score" value="348" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Your turn</p><h2 className="mt-1 text-xl font-extrabold">Pick up where you left off</h2></div><Link to="/games" className="text-sm font-semibold text-primary hover:underline">View all</Link></div>
          <Link to={`/games/${activeGame.id}`} className="mt-5 block rounded-2xl border border-border bg-muted/50 p-5 transition hover:border-primary/30 hover:bg-primary/5"><div className="flex flex-wrap items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-bold text-primary">{activeGame.opponentInitial}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">vs. {activeGame.opponent}</h3><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">Your turn</span></div><p className="mt-1 text-sm text-muted-foreground">{activeGame.score} · Updated {activeGame.updated}</p></div><ArrowRight className="h-5 w-5 text-primary" /></div><div className="mt-5 flex items-center justify-between text-xs text-muted-foreground"><span>Board progress</span><span className="font-bold text-foreground">{activeGame.progress}%</span></div><div className="mt-2 h-2 rounded-full bg-border"><div className="h-full rounded-full bg-primary" style={{ width: `${activeGame.progress}%` }} /></div></Link>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent games</p><h2 className="mt-1 text-xl font-extrabold">Your record</h2></div><Clock3 className="h-5 w-5 text-muted-foreground" /></div><div className="mt-4 divide-y divide-border">{recentGames.slice(0, 3).map((game) => <div key={game.opponent} className="flex items-center gap-3 py-3"><div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${game.result === "Won" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>{game.opponent[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{game.opponent}</p><p className="text-xs text-muted-foreground">{game.score}</p></div><span className={`text-xs font-bold ${game.result === "Won" ? "text-emerald-600" : "text-rose-600"}`}>{game.result}</span></div>)}</div><Link to="/history" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">View match history <ArrowRight className="ml-1.5 h-4 w-4" /></Link></section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-3 text-primary"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">{icon}</span><span className="text-sm font-semibold text-muted-foreground">{label}</span></div><p className="mt-4 text-3xl font-extrabold">{value}</p></div>; }
