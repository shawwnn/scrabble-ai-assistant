// frontend-web/client/pages/Game.tsx

import { useMemo, useState, useEffect } from "react";
import {
  Check,
  CircleHelp,
  Hand,
  Menu as MenuIcon,
  MoreHorizontal,
  RotateCcw,
  Shuffle,
  Sparkles,
  Undo2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ScrabbleBoard from "@/components/ScrabbleBoard";
import {
  getUnseenCounts,
  moveHistory,
  opponentRack,
  rack as initialRack,
  replacementTiles,
  seededTiles,
  suggestions,
  tilePoints,
  validateMove,
  type BoardTile,
  type Tile,
} from "@/lib/game-data";
import { validateMoveBackend } from "../../shared/api";
import { useMoveValidation } from "@shared/integrations/useMoveValidation";

const boardFromSeed = Object.fromEntries(
  Object.entries(seededTiles).map(([key, letter]) => [
    key,
    { letter, points: tilePoints[letter] },
  ]),
);

export default function Game() {
  const [board, setBoard] = useState<Record<string, BoardTile>>(boardFromSeed);
  const [currentRack, setCurrentRack] = useState<Tile[]>(initialRack);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, BoardTile>>({});
  const [bagOpen, setBagOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [replenishOpen, setReplenishOpen] = useState(false);
  const [replenishCount, setReplenishCount] = useState(0);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [draggedRackId, setDraggedRackId] = useState<string | null>(null);
  const [draggedPendingKey, setDraggedPendingKey] = useState<string | null>(
    null,
  );
  const [exchangeSelection, setExchangeSelection] = useState<string[]>([]);
  const [manualSelection, setManualSelection] = useState<string[]>([]);
  const [wildcardKey, setWildcardKey] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [feedback, setFeedback] = useState(
    "Choose a rack tile, then place it on the board.",
  );
  const [score, setScore] = useState(301);

  const validation = useMemo(
    () => validateMove(board, pending),
    [board, pending],
  );

  const currentMoveTiles = useMemo(() => {
    const cells = { ...board, ...pending };
    const keys = [
      ...new Set([...validation.affectedKeys, ...Object.keys(pending)]),
    ];
    return keys.flatMap((key) => {
      const tile = cells[key];
      return tile ? [{ key, letter: tile.letter, tile }] : [];
    });
  }, [board, pending, validation.affectedKeys]);

  // added custom hook to handle JSON Response from the backend validation API call
  const moveValidation = useMoveValidation({
    currentMoveTiles,
    localValidation: validation,
  });
  // added custom hook to handle JSON Response from the backend validation API call

  // added code to backend validation API call
  // useEffect(() => {
  //   console.log("CURRENT MOVE TILES UPDATED:", currentMoveTiles);

  //   validateMoveBackend(currentMoveTiles);
  // }, [currentMoveTiles]);
  // added code to backend validation

  const counts = useMemo(
    () => getUnseenCounts({ ...board, ...pending }, currentRack, opponentRack),
    [board, pending, currentRack],
  );
  const remaining = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const selectedMove = moveHistory.find((move) => move.id === selectedMoveId);
  const drawCount = replenishCount;

  const placeTile = (row: number, col: number, rackId = selectedRackId) => {
    const key = `${row},${col}`;
    if (pending[key]) {
      const tile = pending[key];
      if (tile.wildcard && tile.letter === "?") {
        setWildcardKey(key);
        return;
      }
      setPending((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setCurrentRack((current) => [
        ...current,
        {
          letter: tile.wildcard ? "?" : tile.letter,
          points: tile.points,
          id: `${tile.letter}-returned-${Date.now()}`,
          ...(tile.wildcard ? { wildcard: true } : {}),
        },
      ]);
      setFeedback("Pending tile removed. The move will be checked again.");
      return;
    }
    if (board[key]) {
      setFeedback("That square is already occupied.");
      return;
    }
    if (!rackId) {
      setFeedback("Choose a rack tile first.");
      return;
    }
    const tile = currentRack.find((item) => item.id === rackId);
    if (!tile) return;
    setPending((current) => ({
      ...current,
      [key]: {
        letter: tile.letter,
        points: tile.points,
        pending: true,
        ...(tile.wildcard ? { wildcard: true } : {}),
      },
    }));
    setCurrentRack((current) => current.filter((item) => item.id !== rackId));
    setSelectedRackId(null);
    if (tile.wildcard) setWildcardKey(key);
  };

  const movePendingTile = (fromKey: string, row: number, col: number) => {
    const toKey = `${row},${col}`;
    if (fromKey === toKey || board[toKey] || pending[toKey]) return;
    const tile = pending[fromKey];
    if (!tile) return;

    setPending((current) => {
      const next = { ...current };
      delete next[fromKey];
      next[toKey] = tile;
      return next;
    });
    if (wildcardKey === fromKey) setWildcardKey(toKey);
    setDraggedPendingKey(null);
    setFeedback("Pending tile moved. The move was validated again.");
  };

  const chooseWildcardLetter = (letter: string) => {
    if (!wildcardKey) return;
    setPending((current) => {
      const tile = current[wildcardKey];
      if (!tile) return current;
      return { ...current, [wildcardKey]: { ...tile, letter } };
    });
    setWildcardKey(null);
    setFeedback(`Blank tile set to ${letter}. The move will be checked again.`);
  };

  const submitMove = () => {
    if (validation.status !== "valid") {
      setFeedback(validation.reason);
      return;
    }
    setReplenishCount(Object.keys(pending).length);
    setBoard((current) => ({ ...current, ...pending }));
    setPending({});
    setScore((current) => current + validation.score);
    setFeedback(
      `Move confirmed for ${validation.score} points. Choose how to replenish your rack.`,
    );
    setReplenishOpen(true);
  };

  const openAi = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setAiOpen(true);
    }, 350);
  };

  const drawRandom = () => {
    const drawn = replacementTiles(drawCount, counts);
    setCurrentRack((current) => [...current, ...drawn].slice(0, 7));
    setReplenishOpen(false);
    setReplenishCount(0);
    setFeedback(
      `${drawn.length} tile${drawn.length === 1 ? "" : "s"} drawn from the remaining bag.`,
    );
  };

  const confirmManual = () => {
    const selected = manualSelection.map((letter, index) => ({
      letter,
      points: tilePoints[letter],
      id: `${letter}-picked-${Date.now()}-${index}`,
      ...(letter === "?" ? { wildcard: true } : {}),
    }));
    setCurrentRack((current) => [...current, ...selected].slice(0, 7));
    setManualSelection([]);
    setReplenishOpen(false);
    setReplenishCount(0);
    setFeedback("Your rack has been replenished from the tile bag.");
  };

  const shuffleRack = () =>
    setCurrentRack((current) => [...current].sort(() => Math.random() - 0.5));

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-extrabold">
            You vs. JohnDoe{" "}
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
              YOUR TURN
            </span>
          </h1>
        </div>
        <div className="hidden items-center gap-2 xl:flex">
          <Button variant="outline" size="sm" className="rounded-lg">
            <CircleHelp className="h-4 w-4" /> How to play
          </Button>
          <Button variant="outline" size="icon" className="rounded-lg">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <main className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <ScoreCard name="QwithU" score={String(score)} active />
            <ScoreCard name="JohnDoe" score="312" />
          </div>
          <section className="rounded-2xl border border-border bg-card p-2 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Turn 14 · your turn
                </p>
                <h2 className="text-lg font-bold">Build your word</h2>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${validation.status === "valid" ? "bg-emerald-100 text-emerald-700" : validation.status === "invalid" ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground"}`}
              >
                {validation.status === "valid"
                  ? "✓ Valid move"
                  : validation.status === "invalid"
                    ? "✕ Invalid move"
                    : "Ready"}
              </span>
            </div>
            <ScrabbleBoard
              board={board}
              pending={pending}
              affectedKeys={validation.affectedKeys}
              // Backend-aware validation overrides the local validation UI state.
              // validationStatus={validation.status}
              // moveScore={validation.score}

              validationStatus={moveValidation.status}
              moveScore={moveValidation.moveScore}
              // Backend-aware validation overrides the local validation UI state.
              onCellClick={placeTile}
              onPendingDragStart={setDraggedPendingKey}
              onCellDrop={(row, col) => {
                if (draggedPendingKey)
                  movePendingTile(draggedPendingKey, row, col);
                else if (draggedRackId) placeTile(row, col, draggedRackId);
                setDraggedRackId(null);
                setDraggedPendingKey(null);
              }}
            />
            <div
              className={`mt-2 rounded-lg px-3 py-2 text-xs ${validation.status === "valid" ? "bg-emerald-50 text-emerald-700" : validation.status === "invalid" ? "bg-rose-50 text-rose-700" : "bg-muted text-muted-foreground"}`}
              aria-live="polite"
            >
              {validation.status === "valid"
                ? `${validation.reason} Score: ${validation.score} points.`
                : validation.reason || feedback}
            </div>
            <div className="mt-2 flex items-center justify-end gap-2 xl:hidden">
              <Button variant="outline" size="sm" className="rounded-lg">
                <CircleHelp className="h-4 w-4" /> How to play
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg"
                aria-label="More game options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your rack
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentRack.length} tiles available
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCurrentRack((current) =>
                    [...current].sort((a, b) =>
                      a.letter.localeCompare(b.letter),
                    ),
                  )
                }
              >
                <RotateCcw className="h-4 w-4" /> Sort
              </Button>
            </div>
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {currentRack.map((tile) => (
                <button
                  type="button"
                  key={tile.id}
                  draggable
                  onDragStart={() => setDraggedRackId(tile.id)}
                  onDragEnd={() => setDraggedRackId(null)}
                  onClick={() => setSelectedRackId(tile.id)}
                  aria-pressed={selectedRackId === tile.id}
                  className={`relative grid h-14 min-w-10 flex-1 max-w-14 place-items-center rounded-lg border text-xl font-extrabold shadow-sm sm:h-16 ${selectedRackId === tile.id ? "-translate-y-1 border-primary bg-primary/10 ring-2 ring-primary/20" : "border-amber-200 bg-tile text-slate-800 hover:-translate-y-0.5"}`}
                >
                  {tile.letter}
                  <small className="absolute bottom-1 right-1 text-[9px]">
                    {tile.points}
                  </small>
                </button>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-[.9fr_1fr_1.7fr_1fr_1fr] gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              className="h-11 px-1 text-[11px] sm:px-3 sm:text-sm"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon className="h-4 w-4" /> Menu
            </Button>
            <Button
              variant="outline"
              className="h-11 px-1 text-[11px] sm:px-3 sm:text-sm"
              onClick={openAi}
              disabled={aiLoading}
            >
              <Sparkles className="h-4 w-4" />{" "}
              {aiLoading ? "Analyzing..." : "AI Hint"}
            </Button>

            <Button
              className="h-11 bg-primary px-2 text-xs font-extrabold hover:bg-primary/90 sm:px-5 sm:text-sm"
              disabled={validation.status !== "valid"}
              onClick={submitMove}
            >
              <Check className="h-4 w-4" /> Submit
            </Button>
            <Button
              variant="outline"
              className="h-11 px-1 text-[11px] sm:px-3 sm:text-sm"
              onClick={shuffleRack}
            >
              <Shuffle className="h-4 w-4" /> Shuffle
            </Button>
            <Button
              variant="outline"
              className="h-11 px-1 text-[11px] sm:px-3 sm:text-sm"
              onClick={() => setBagOpen(true)}
            >
              <span className="font-bold">{remaining}</span> Bag
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const keys = Object.keys(pending);
              const key = keys[keys.length - 1];
              if (!key) return;
              const tile = pending[key];
              setPending((current) => {
                const next = { ...current };
                delete next[key];
                return next;
              });
              setCurrentRack((current) => [
                ...current,
                {
                  letter: tile.wildcard ? "?" : tile.letter,
                  points: tile.points,
                  id: `${tile.letter}-undo-${Date.now()}`,
                  ...(tile.wildcard ? { wildcard: true } : {}),
                },
              ]);
              if (wildcardKey === key) setWildcardKey(null);
            }}
          >
            <Undo2 className="h-4 w-4" /> Undo last tile
          </Button>
        </main>

        <aside className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Move history
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select a move to inspect its board moment.
            </p>
            <div className="mt-3 space-y-1">
              {moveHistory.map((move) => (
                <button
                  type="button"
                  key={move.id}
                  onClick={() => setSelectedMoveId(move.id)}
                  className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left hover:border-primary/20 hover:bg-primary/5"
                >
                  <span className="w-5 text-[10px] text-muted-foreground">
                    {move.turn}
                  </span>
                  <strong className="flex-1 text-xs">{move.word}</strong>
                  <span className="text-xs font-bold text-primary">
                    {move.score}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {move.time}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Language" value="English" />
            <Info label="Dictionary" value="Collins Scrabble" />
            <Info label="Tiles left" value={String(remaining)} />
            <Info label="Turn" value="Your turn" />
          </div>
        </aside>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Game menu</SheetTitle>
            <SheetDescription>
              Secondary actions for this turn.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" asChild>
              <Link to="/games" onClick={() => setMenuOpen(false)}>
                Show all games
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMenuOpen(false);
                setPassOpen(true);
              }}
            >
              <Hand className="h-4 w-4" /> Pass turn
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMenuOpen(false);
                setExchangeOpen(true);
              }}
            >
              <Shuffle className="h-4 w-4" /> Exchange tiles
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>Tile bag</SheetTitle>
            <SheetDescription>
              {remaining} unseen tiles remain after the visible board and racks.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <Info label="Total" value={String(remaining)} />
            <Info
              label="Vowels"
              value={String(
                ["A", "E", "I", "O", "U"].reduce(
                  (sum, letter) => sum + counts[letter],
                  0,
                ),
              )}
            />
            <Info label="Blanks" value={String(counts["?"])} />
          </div>
          <div className="mt-6 grid grid-cols-5 gap-2">
            {Object.entries(counts).map(([letter, count]) => (
              <div
                key={letter}
                className={`rounded-lg border p-2 text-center ${count ? "border-amber-200 bg-tile" : "border-border bg-muted text-muted-foreground"}`}
              >
                <strong className="text-lg">{letter}</strong>
                <p className="text-[10px] font-bold">{count} left</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Hint
            </SheetTitle>
            <SheetDescription>
              Top 5 legal moves for the current board and rack. Suggestions are
              informational only.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.word}
                className={`w-full rounded-xl border p-3 ${index === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <strong className="flex-1">{suggestion.word}</strong>
                  <span className="font-bold text-primary">
                    {suggestion.score} pts
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {suggestion.usage} · {suggestion.note}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <Dialog
        open={Boolean(wildcardKey)}
        onOpenChange={(open) => {
          if (!open) setWildcardKey(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Choose a blank tile letter</DialogTitle>
            <DialogDescription>
              Select the letter this blank tile represents for your current
              move.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 26 }, (_, index) =>
              String.fromCharCode(65 + index),
            ).map((letter) => (
              <Button
                key={letter}
                variant="outline"
                className="h-10 px-0 text-lg font-extrabold"
                onClick={() => chooseWildcardLetter(letter)}
              >
                {letter}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={replenishOpen} onOpenChange={setReplenishOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Move submitted successfully</DialogTitle>
            <DialogDescription>
              {drawCount} tile{drawCount === 1 ? "" : "s"} played. Pick{" "}
              {drawCount} tile{drawCount === 1 ? "" : "s"} from the remaining
              bag, or draw randomly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button onClick={drawRandom}>Draw Random Tiles</Button>
            <div>
              <p className="mb-2 text-sm font-semibold">
                Pick from Tile Bag{" "}
                {manualSelection.length
                  ? `(${manualSelection.length}/${drawCount})`
                  : ""}
              </p>
              <div className="grid grid-cols-6 gap-1">
                {Object.entries(counts).map(([letter, count]) => (
                  <button
                    type="button"
                    key={letter}
                    disabled={!count || manualSelection.length >= drawCount}
                    onClick={() =>
                      setManualSelection((current) => [...current, letter])
                    }
                    className="rounded border border-amber-200 bg-tile py-2 text-sm font-bold disabled:opacity-40"
                  >
                    {letter}
                    <small className="block text-[9px]">{count}</small>
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="secondary"
              disabled={manualSelection.length !== drawCount}
              onClick={confirmManual}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={passOpen} onOpenChange={setPassOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pass this turn?</AlertDialogTitle>
            <AlertDialogDescription>
              Your pending move will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep playing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPending({});
                setWildcardKey(null);
                setPassOpen(false);
              }}
            >
              Pass turn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={exchangeOpen} onOpenChange={setExchangeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exchange tiles</AlertDialogTitle>
            <AlertDialogDescription>
              Select up to seven rack tiles to return to the bag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-wrap justify-center gap-2">
            {currentRack.map((tile) => (
              <button
                type="button"
                key={tile.id}
                onClick={() =>
                  setExchangeSelection((current) =>
                    current.includes(tile.id)
                      ? current.filter((id) => id !== tile.id)
                      : current.length < 7
                        ? [...current, tile.id]
                        : current,
                  )
                }
                className={`relative grid h-12 w-10 place-items-center rounded-lg border text-lg font-extrabold ${exchangeSelection.includes(tile.id) ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-amber-200 bg-tile"}`}
              >
                {tile.letter}
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExchangeSelection([])}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!exchangeSelection.length}
              onClick={() => {
                const replacement = replacementTiles(
                  exchangeSelection.length,
                  counts,
                );
                setCurrentRack((current) => [
                  ...current.filter(
                    (tile) => !exchangeSelection.includes(tile.id),
                  ),
                  ...replacement,
                ]);
                setExchangeSelection([]);
                setExchangeOpen(false);
              }}
            >
              Exchange {exchangeSelection.length || ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={Boolean(selectedMove)}
        onOpenChange={(open) => {
          if (!open) setSelectedMoveId(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMove?.word} · {selectedMove?.score} points
            </DialogTitle>
            <DialogDescription>
              {selectedMove?.player} played this move on turn{" "}
              {selectedMove?.turn}.
            </DialogDescription>
          </DialogHeader>
          {selectedMove && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Direction" value={selectedMove.direction} />
                <Info label="Position" value={selectedMove.position} />
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMove.tiles.map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className="grid h-11 w-9 place-items-center rounded-lg border border-amber-200 bg-tile text-lg font-extrabold text-slate-800"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreCard({
  name,
  score,
  active = false,
}: {
  name: string;
  score: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 ${active ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {name[0]}
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground">
            {active ? "You" : "Opponent"}
          </p>
          <p className="text-sm font-semibold">{name}</p>
        </div>
        <strong className="text-xl sm:text-2xl">{score}</strong>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
