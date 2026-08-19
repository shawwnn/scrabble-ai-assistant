import {
  getPremium,
  seededTiles,
  tilePoints,
  type BoardTile,
} from "@/lib/game-data";

const premiumStyles = {
  tw: "bg-premium-tw text-white",
  dw: "bg-premium-dw text-rose-700",
  tl: "bg-premium-tl text-white",
  dl: "bg-premium-dl text-sky-800",
  star: "bg-premium-star text-white",
};
const premiumLabels = { tw: "TW", dw: "DW", tl: "TL", dl: "DL", star: "★" };

type Props = {
  board?: Record<string, BoardTile>;
  pending?: Record<string, BoardTile>;
  onCellClick?: (row: number, col: number) => void;
  onCellDrop?: (row: number, col: number) => void;
  onPendingDragStart?: (key: string) => void;
  validationStatus?: "unchanged" | "valid" | "invalid";
  moveScore?: number;
};

export default function ScrabbleBoard({
  board = Object.fromEntries(
    Object.entries(seededTiles).map(([key, letter]) => [
      key,
      { letter, points: tilePoints[letter] },
    ]),
  ),
  pending = {},
  onCellClick,
  onCellDrop,
  onPendingDragStart,
  validationStatus = "unchanged",
  moveScore = 0,
}: Props) {
  return (
    <div className="board-shell mx-auto w-full min-w-[320px] max-w-[720px] rounded-2xl p-2 shadow-xl sm:p-3">
      <div className="grid aspect-square w-full min-w-[320px] grid-cols-15 overflow-visible rounded-xl border-2 border-board-edge bg-board-deep">
        {Array.from({ length: 225 }, (_, index) => {
          const row = Math.floor(index / 15);
          const col = index % 15;
          const key = `${row},${col}`;
          const premium = getPremium(row, col);
          const tile = pending[key] ?? board[key];
          const isPending = Boolean(pending[key]);
          const pendingKeys = Object.keys(pending);
          const scoreAnchor = pendingKeys[pendingKeys.length - 1] === key;
          return (
            <button
              type="button"
              key={key}
              aria-label={
                tile
                  ? `${tile.letter} at row ${row + 1}, column ${col + 1}${isPending ? ", pending" : ""}`
                  : `Empty board square at row ${row + 1}, column ${col + 1}`
              }
              onClick={() => onCellClick?.(row, col)}
              draggable={isPending}
              onDragStart={() => {
                if (isPending) onPendingDragStart?.(key);
              }}
              onDragOver={(event) => {
                if (onCellDrop) event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                onCellDrop?.(row, col);
              }}
              className={`board-cell relative min-h-0 min-w-0 border border-board-edge/70 text-[clamp(6px,1.45vw,11px)] font-black ${premium ? premiumStyles[premium] : "bg-board"} ${isPending && validationStatus === "valid" ? "ring-2 ring-inset ring-emerald-400" : ""} ${isPending && validationStatus === "invalid" ? "ring-2 ring-inset ring-rose-500" : ""} ${isPending && validationStatus === "unchanged" ? "ring-2 ring-inset ring-amber-300" : ""} ${onCellClick ? "cursor-pointer hover:brightness-110 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-white" : "cursor-default"}`}
            >
              {premium && !tile && (
                <span className="absolute inset-0 grid place-items-center tracking-tight opacity-90">
                  {premiumLabels[premium]}
                </span>
              )}
              {tile && (
                <span
                  className={`absolute inset-[10%] grid place-items-center rounded-[18%] border text-[clamp(11px,3.7vw,24px)] leading-none shadow-[0_2px_3px_rgba(15,23,42,.3)] ${isPending && validationStatus === "valid" ? "border-emerald-400 bg-tile text-slate-900" : isPending && validationStatus === "invalid" ? "border-rose-500 bg-tile text-slate-900" : isPending ? "border-amber-300 bg-tile text-slate-900" : "border-[#d6bc82] bg-tile text-slate-900"}`}
                >
                  {tile.letter}
                  <small className="absolute bottom-[7%] right-[8%] text-[clamp(5px,1.35vw,10px)] font-bold">
                    {tile.points}
                  </small>
                </span>
              )}
              {isPending &&
                scoreAnchor &&
                validationStatus === "valid" &&
                moveScore > 0 && (
                  <span className="pointer-events-none absolute left-[62%] top-[92%] z-20 whitespace-nowrap rounded-full bg-emerald-500 px-1 py-0.5 text-[8px] font-extrabold text-white shadow">
                    +{moveScore}
                  </span>
                )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-semibold text-white/65 sm:text-xs">
        <span>Tap a square to place</span>
        <span>Drag tiles from your rack</span>
      </div>
    </div>
  );
}
