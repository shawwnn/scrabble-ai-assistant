export default function ScrabbleTileLogo() {
  return (
    <div className="relative h-28 w-36" aria-hidden="true">
      <div className="absolute left-0 top-3 h-20 w-20 rotate-[-12deg] rounded-xl bg-white shadow-md ring-1 ring-slate-200">
        <span className="absolute left-2.5 top-2.5 h-3 w-3 rounded-sm bg-red-500" />
        <span className="absolute bottom-2.5 right-2.5 h-3 w-3 rounded-sm bg-sky-300" />
      </div>
      <div className="absolute right-0 top-0 h-20 w-20 rotate-[8deg] rounded-xl bg-white shadow-md ring-1 ring-slate-200">
        <span className="absolute left-2.5 bottom-2.5 h-3 w-3 rounded-sm bg-sky-400" />
        <span className="absolute right-2.5 top-2.5 h-3 w-3 rounded-sm bg-slate-300" />
      </div>
      <div className="absolute left-1/2 top-2 grid h-20 w-20 -translate-x-1/2 rotate-[4deg] place-items-center rounded-xl bg-[#e8c28f] shadow-lg ring-1 ring-amber-700/30">
        <span className="text-4xl font-extrabold text-slate-900">S</span>
        <span className="absolute bottom-1.5 right-2 text-xs font-bold text-slate-900">1</span>
      </div>
    </div>
  );
}
