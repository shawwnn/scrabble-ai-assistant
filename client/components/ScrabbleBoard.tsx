import { getPremium, seededTiles, tilePoints, type BoardTile } from "@/lib/game-data";

const premiumStyles = { tw: "bg-rose-500 text-white", dw: "bg-rose-100 text-rose-600", tl: "bg-sky-500 text-white", dl: "bg-sky-100 text-sky-700", star: "bg-amber-400 text-white" };
const premiumLabels = { tw: "TW", dw: "DW", tl: "TL", dl: "DL", star: "★" };

type Props = {
  board?: Record<string, BoardTile>;
  pending?: Record<string, BoardTile>;
  preview?: Record<string, BoardTile>;
  onCellClick?: (row: number, col: number) => void;
};

export default function ScrabbleBoard({ board = Object.fromEntries(Object.entries(seededTiles).map(([key, letter]) => [key, { letter, points: tilePoints[letter] }])), pending = {}, preview = {}, onCellClick }: Props) {
  return <div className="mx-auto w-full max-w-[720px] overflow-auto rounded-2xl bg-board-deep p-2 shadow-xl shadow-slate-900/10 sm:p-3"><div className="grid min-w-[560px] grid-cols-15 overflow-hidden rounded-lg border-2 border-board-edge">{Array.from({ length: 225 }, (_, index) => { const row = Math.floor(index / 15), col = index % 15, key = `${row},${col}`, premium = getPremium(row, col), tile = pending[key] ?? preview[key] ?? board[key]; const isPending = Boolean(pending[key]); const isPreview = Boolean(preview[key]) && !isPending; return <button type="button" key={key} aria-label={tile ? `${tile.letter} at row ${row + 1}, column ${col + 1}${isPending ? ", pending" : ""}` : `Empty board square at row ${row + 1}, column ${col + 1}`} onClick={() => onCellClick?.(row, col)} className={`relative aspect-square border border-[#287278]/60 text-[8px] font-extrabold sm:text-[10px] ${premium ? premiumStyles[premium] : "bg-board"} ${isPending ? "ring-2 ring-inset ring-amber-300" : ""} ${isPreview ? "ring-2 ring-inset ring-violet-300 opacity-90" : ""} ${onCellClick ? "cursor-pointer hover:brightness-110" : "cursor-default"}`}>{tile && <span className={`absolute inset-[2px] grid place-items-center rounded-[3px] text-sm text-slate-800 shadow-sm sm:text-base ${isPreview ? "bg-violet-100" : isPending ? "bg-amber-100" : "bg-[#fff8e8]"}`}>{tile.letter}<small className="absolute bottom-0 right-0.5 text-[7px] font-bold">{tile.points}</small></span>}{!tile && premium && premiumLabels[premium]}</button> })}</div></div>;
}
