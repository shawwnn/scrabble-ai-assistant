import { useMemo, useState } from "react";
import { ArrowLeft, Check, CircleHelp, Hand, Lightbulb, MoreHorizontal, RotateCcw, Shuffle, Sparkles, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ScrabbleBoard from "@/components/ScrabbleBoard";
import { getUnseenCounts, moveHistory, opponentRack, rack as initialRack, replacementTiles, seededTiles, suggestions, tilePoints, type BoardTile, type Tile } from "@/lib/game-data";

const boardFromSeed = Object.fromEntries(Object.entries(seededTiles).map(([key, letter]) => [key, { letter, points: tilePoints[letter] }]));

export default function Game() {
  const [board, setBoard] = useState<Record<string, BoardTile>>(boardFromSeed);
  const [currentRack, setCurrentRack] = useState<Tile[]>(initialRack);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, BoardTile>>({});
  const [exchangeSelection, setExchangeSelection] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, BoardTile>>({});
  const [bagOpen, setBagOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [draggedRackId, setDraggedRackId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Select a tile, then choose an open square on the board.");
  const [score, setScore] = useState(301);

  const counts = useMemo(() => getUnseenCounts({ ...board, ...pending }, currentRack, opponentRack), [board, pending, currentRack]);
  const remaining = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const selectedMove = moveHistory.find((move) => move.id === selectedMoveId);

  const placeTile = (row: number, col: number, rackId = selectedRackId) => {
    const key = `${row},${col}`;
    if (pending[key]) {
      const tile = pending[key];
      setPending((current) => { const next = { ...current }; delete next[key]; return next; });
      setCurrentRack((current) => [...current, { letter: tile.letter, points: tile.points, id: `${tile.letter}-returned-${Date.now()}` }]);
      setFeedback("Pending tile removed from the board.");
      return;
    }
    if (board[key] || preview[key]) { setFeedback("That square is already occupied. Choose an open square."); return; }
    if (!rackId) { setFeedback("Choose a rack tile first."); return; }
    const tile = currentRack.find((item) => item.id === rackId);
    if (!tile) return;
    setPending((current) => ({ ...current, [key]: { letter: tile.letter, points: tile.points, pending: true } }));
    setCurrentRack((current) => current.filter((item) => item.id !== rackId));
    setSelectedRackId(null);
    setFeedback(`${tile.letter} placed as a pending tile. Submit when ready.`);
  };

  const submitMove = () => {
    const placed = Object.keys(pending).length;
    if (!placed) { setFeedback("Place at least one tile before submitting."); return; }
    setBoard((current) => ({ ...current, ...pending }));
    setPending({});
    setScore((current) => current + placed * 8);
    setFeedback(`Move submitted locally for ${placed * 8} points. Your turn continues in this preview.`);
  };

  const showSuggestion = (index: number) => {
    const suggestion = suggestions[index];
    const next: Record<string, BoardTile> = {};
    [...suggestion.word].forEach((letter, offset) => {
      const row = suggestion.start[0] + (suggestion.direction === "down" ? offset : 0);
      const col = suggestion.start[1] + (suggestion.direction === "across" ? offset : 0);
      const key = `${row},${col}`;
      if (!board[key]) next[key] = { letter, points: tilePoints[letter], preview: true };
    });
    setPreview(next);
    setFeedback(`${suggestion.word} is previewed in violet. Apply it or keep playing manually.`);
  };

  const confirmExchange = () => {
    const replacement = replacementTiles(exchangeSelection.length, counts);
    setCurrentRack((current) => [...current.filter((tile) => !exchangeSelection.includes(tile.id)), ...replacement]);
    setExchangeSelection([]); setExchangeOpen(false);
    setFeedback(`${replacement.length} tile${replacement.length === 1 ? "" : "s"} exchanged locally. The bag count has updated.`);
  };

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/games" className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> All games</Link>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-extrabold">You vs. JohnDoe <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">YOUR TURN</span></h1>
        </div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="rounded-lg"><CircleHelp className="h-4 w-4" /> How to play</Button><Button variant="outline" size="icon" className="rounded-lg"><MoreHorizontal className="h-4 w-4" /></Button></div>
      </header>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <main className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3"><ScoreCard name="QwithU" score={String(score)} active /><ScoreCard name="JohnDoe" score="312" /></div>
          <section className="rounded-2xl border border-border bg-card p-3 shadow-sm md:p-5">
            <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Turn 14 · local preview</p><h2 className="text-lg font-bold">Build your word</h2></div><span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{Object.keys(pending).length ? `${Object.keys(pending).length} pending` : "Ready"}</span></div>
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-sm text-foreground"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span aria-live="polite">{feedback}</span></div>
            <ScrabbleBoard board={board} pending={pending} preview={preview} onCellClick={placeTile} onCellDrop={(row, col) => { if (draggedRackId) placeTile(row, col, draggedRackId); setDraggedRackId(null); }} />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center"><Button variant="ghost" size="sm" onClick={() => { const keys = Object.keys(pending); const key = keys[keys.length - 1]; if (!key) { setFeedback("There are no pending tiles to undo."); return; } const tile = pending[key]; setPending((current) => { const next = { ...current }; delete next[key]; return next; }); setCurrentRack((current) => [...current, { letter: tile.letter, points: tile.points, id: `${tile.letter}-undo-${Date.now()}` }]); setFeedback("Last pending placement undone."); }}><Undo2 className="h-4 w-4" /> Undo</Button><Button variant="outline" size="sm" onClick={() => setPassOpen(true)}><Hand className="h-4 w-4" /> Pass</Button><Button variant="outline" size="sm" onClick={() => setExchangeOpen(true)}><Shuffle className="h-4 w-4" /> Exchange</Button><Button size="sm" onClick={() => { setAiOpen(true); showSuggestion(0); }}><Sparkles className="h-4 w-4" /> AI hint</Button><Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={submitMove}><Check className="h-4 w-4" /> Submit</Button></div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-3 shadow-sm md:p-5"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your rack</p><p className="text-sm text-muted-foreground">{currentRack.length} tiles available</p></div><Button variant="ghost" size="sm" onClick={() => setCurrentRack((current) => [...current].sort((a, b) => a.letter.localeCompare(b.letter)))}><RotateCcw className="h-4 w-4" /> Sort</Button></div><div className="flex flex-wrap justify-center gap-2">{currentRack.map((tile) => <button type="button" key={tile.id} draggable onDragStart={() => setDraggedRackId(tile.id)} onDragEnd={() => setDraggedRackId(null)} onClick={() => setSelectedRackId(tile.id)} aria-pressed={selectedRackId === tile.id} className={`relative grid h-14 w-12 place-items-center rounded-lg border text-xl font-extrabold shadow-sm ${selectedRackId === tile.id ? "-translate-y-1 border-violet-500 bg-violet-100 ring-2 ring-violet-200" : "border-amber-200 bg-tile text-slate-800 hover:-translate-y-0.5"}`}>{tile.letter}<small className="absolute bottom-1 right-1 text-[9px]">{tile.points}</small></button>)}</div></section>
        </main>

        <aside className="min-w-0 space-y-4"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Game tools</p><div className="mt-3 grid gap-2"><Button variant="outline" className="justify-start" onClick={() => setBagOpen(true)}><span className="grid h-6 w-6 place-items-center rounded bg-amber-100 text-xs font-bold text-amber-700">{remaining}</span> Tile bag <span className="ml-auto text-xs text-muted-foreground">unseen</span></Button><Button variant="outline" className="justify-start" onClick={() => { setAiOpen(true); showSuggestion(0); }}><Lightbulb className="h-4 w-4 text-violet-600" /> AI suggestions <span className="ml-auto text-xs text-muted-foreground">Top 5</span></Button></div></section><div className="grid grid-cols-2 gap-3"><Info label="Language" value="English" /><Info label="Dictionary" value="Collins Scrabble" /><Info label="Tiles left" value={String(remaining)} /><Info label="Turn" value="Your turn" /></div><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Move history</p><p className="mt-1 text-sm text-muted-foreground">Select a move to inspect the board moment.</p></div><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{moveHistory.length} moves</span></div><div className="mt-4 space-y-2">{moveHistory.map((move, index) => <button type="button" key={move.id} onClick={() => setSelectedMoveId(move.id)} className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left hover:border-primary/20 hover:bg-primary/5"><span className="w-5 text-center text-xs font-bold text-muted-foreground">{index + 1}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-bold">{move.player[0]}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{move.word}</strong><span className="text-xs text-muted-foreground">{move.player} · {move.time}</span></span><span className="text-sm font-bold text-primary">{move.score}</span></button>)}</div></section></aside>
      </div>

      <Sheet open={bagOpen} onOpenChange={setBagOpen}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>Tile bag</SheetTitle><SheetDescription>{remaining} unseen tiles remain after the visible board and racks.</SheetDescription></SheetHeader><div className="mt-6 grid grid-cols-3 gap-2"><Info label="Total" value={String(remaining)} /><Info label="Vowels" value={String(["A", "E", "I", "O", "U"].reduce((sum, letter) => sum + counts[letter], 0))} /><Info label="Consonants" value={String(Object.entries(counts).filter(([letter]) => !["A", "E", "I", "O", "U", "?"].includes(letter)).reduce((sum, [, count]) => sum + count, 0))} /></div><div className="mt-6 grid grid-cols-5 gap-2">{Object.entries(counts).map(([letter, count]) => <div key={letter} className={`rounded-lg border p-2 text-center ${count ? "border-amber-200 bg-tile" : "border-border bg-muted text-muted-foreground"}`}><strong className="text-lg">{letter}</strong><p className="text-[10px] font-bold">{count} left</p></div>)}</div></SheetContent></Sheet>
      <Sheet open={aiOpen} onOpenChange={setAiOpen}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-600" /> AI suggestions</SheetTitle><SheetDescription>Top 5 moves for your current rack. Violet tiles are a preview only.</SheetDescription></SheetHeader><div className="mt-6 space-y-3">{suggestions.map((suggestion, index) => <button type="button" key={suggestion.word} onClick={() => showSuggestion(index)} className={`w-full rounded-xl border p-3 text-left ${index === 0 ? "border-violet-300 bg-violet-50" : "border-border hover:border-violet-200"}`}><div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded bg-violet-600 text-xs font-bold text-white">{index + 1}</span><strong className="flex-1">{suggestion.word}</strong><span className="font-bold text-violet-700">{suggestion.score} pts</span></div><div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{suggestion.usage}</span><span>{suggestion.note}</span></div></button>)}</div><Button className="mt-5 w-full" onClick={() => { setPending((current) => ({ ...current, ...preview })); setPreview({}); setAiOpen(false); setFeedback("AI move staged as pending tiles. Submit to commit it."); }}>Apply preview</Button></SheetContent></Sheet>
      <AlertDialog open={passOpen} onOpenChange={setPassOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Pass this turn?</AlertDialogTitle><AlertDialogDescription>Passing ends your current turn. This local preview will keep the game open so you can continue testing.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep playing</AlertDialogCancel><AlertDialogAction onClick={() => { setPending({}); setSelectedRackId(null); setPassOpen(false); setFeedback("You passed this turn. This local preview will keep the game open."); }}>Pass turn</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <Dialog open={Boolean(selectedMove)} onOpenChange={(open) => { if (!open) setSelectedMoveId(null); }}><DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl"><DialogHeader><DialogTitle>{selectedMove?.word} · {selectedMove?.score} points</DialogTitle><DialogDescription>{selectedMove?.player} played this move on turn {selectedMove?.turn}.</DialogDescription></DialogHeader>{selectedMove && <div className="space-y-5"><div className="grid grid-cols-2 gap-3"><Info label="Direction" value={selectedMove.direction} /><Info label="Position" value={selectedMove.position} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tiles played</p><div className="mt-3 flex flex-wrap gap-2">{selectedMove.tiles.map((letter, index) => <span key={`${letter}-${index}`} className="grid h-11 w-9 place-items-center rounded-lg border border-amber-200 bg-tile text-lg font-extrabold text-slate-800">{letter}</span>)}</div></div><div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Played {selectedMove.time}. The board position is shown in the move record for turn {selectedMove.turn}.</div></div>}</DialogContent></Dialog>
      <AlertDialog open={exchangeOpen} onOpenChange={setExchangeOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Exchange tiles</AlertDialogTitle><AlertDialogDescription>Select up to 7 tiles to return to the bag. Choose at least one tile to enable the exchange.</AlertDialogDescription></AlertDialogHeader><div className="flex flex-wrap justify-center gap-2">{currentRack.map((tile) => <button type="button" key={tile.id} onClick={() => setExchangeSelection((current) => current.includes(tile.id) ? current.filter((id) => id !== tile.id) : current.length < 7 ? [...current, tile.id] : current)} className={`relative grid h-12 w-10 place-items-center rounded-lg border text-lg font-extrabold ${exchangeSelection.includes(tile.id) ? "border-violet-500 bg-violet-100 ring-2 ring-violet-200" : "border-amber-200 bg-tile"}`}>{tile.letter}<small className="absolute bottom-0.5 right-0.5 text-[8px]">{tile.points}</small></button>)}</div><AlertDialogFooter><AlertDialogCancel onClick={() => setExchangeSelection([])}>Cancel</AlertDialogCancel><AlertDialogAction disabled={!exchangeSelection.length} onClick={confirmExchange}>Exchange {exchangeSelection.length || ""}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function ScoreCard({ name, score, active = false }: { name: string; score: string; active?: boolean }) { return <div className={`rounded-2xl border p-4 ${active ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{name[0]}</div><div className="flex-1"><p className="text-xs text-muted-foreground">{active ? "You" : "Opponent"}</p><p className="font-semibold">{name}</p></div><strong className="text-2xl">{score}</strong></div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted p-3"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>; }
