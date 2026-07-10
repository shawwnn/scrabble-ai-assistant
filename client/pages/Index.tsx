import { useState } from "react";
import { 
  Home, 
  Gamepad2, 
  History, 
  Settings,
  Bell,
  Search,
  ChevronRight,
  Shuffle,
  Hand,
  ArrowRightLeft,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BOARD_SIZE = 15;

interface Player {
  name: string;
  initials: string;
  score: number;
  color: string;
}

interface GameState {
  currentPlayer: 0 | 1;
  players: Player[];
  selectedTiles: Set<number>;
}

export default function Index() {
  const [gameState] = useState<GameState>({
    currentPlayer: 0,
    players: [
      { name: "QwithU", initials: "Q", score: 301, color: "bg-indigo-600" },
      { name: "JohnDoe", initials: "J", score: 312, color: "bg-amber-500" },
    ],
    selectedTiles: new Set(),
  });

  const [sidebarOpen] = useState(true);
  const tiles = ["A", "T", "R", "E", "L", "O", "N"];
  const tilesLeft = 7;

  const board = Array(BOARD_SIZE * BOARD_SIZE).fill(null).map((_, i) => {
    const row = Math.floor(i / BOARD_SIZE);
    const col = i % BOARD_SIZE;

    // Center star
    if (row === 7 && col === 7) return "center";

    // Default green
    return "green";
  });

  const getSquareColor = (type: string | null) => {
    switch(type) {
      case "center": return "bg-red-600";
      case "green": return "bg-green-700";
      default: return "bg-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold tracking-widest">SCRABBLE</div>
          <span className="text-xs text-slate-400">Home</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1 bg-indigo-600 border-0 text-white hover:bg-indigo-700 h-8 px-3">
            <span className="text-sm">+</span> New Game
          </Button>
          <Bell className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-200" />
          <Search className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-200" />
          <div className="text-xs text-slate-400 cursor-pointer hover:text-slate-200">QwithU</div>
        </div>
      </header>

      <div className="flex gap-3 p-3 h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-48 space-y-4 overflow-y-auto">
            {/* Navigation */}
            <nav className="space-y-1">
              {[
                { icon: Home, label: "Home", active: true },
                { icon: Gamepad2, label: "Game", active: false },
                { icon: History, label: "History", active: false },
                { icon: Settings, label: "Settings", active: false },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded transition text-xs ${
                    item.active
                      ? "bg-indigo-600/30 text-indigo-400 border-l-2 border-indigo-600"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Your Turn */}
            <div>
              <h3 className="text-xs font-semibold text-orange-400 uppercase mb-2">Your Turn</h3>
              <div className="space-y-1">
                <div className="bg-slate-800/60 rounded p-2 text-xs">
                  <div className="font-semibold text-sm">JohnDoe</div>
                  <div className="text-slate-400 text-xs">312 vs 301</div>
                  <div className="text-xs text-orange-400 mt-0.5">Your turn</div>
                </div>
                <div className="bg-slate-800/40 rounded p-2 text-xs">
                  <div className="font-semibold text-sm">AcePlayer</div>
                  <div className="text-slate-400 text-xs">321 vs 205</div>
                  <div className="text-xs text-slate-500 mt-0.5">Your turn</div>
                </div>
              </div>
            </div>

            {/* Their Turn */}
            <div>
              <h3 className="text-xs font-semibold text-orange-400 uppercase mb-2">Their Turn</h3>
              <div className="space-y-1">
                <div className="bg-slate-800/40 rounded p-2 text-xs">
                  <div className="font-semibold text-sm">MiseLee</div>
                  <div className="text-slate-400 text-xs">312 vs 289</div>
                  <div className="text-xs text-slate-500 mt-0.5">Last move 1 min ago</div>
                </div>
                <div className="bg-slate-800/40 rounded p-2 text-xs">
                  <div className="font-semibold text-sm">SaraK</div>
                  <div className="text-slate-400 text-xs">398 vs 290</div>
                  <div className="text-xs text-slate-500 mt-0.5">Last move 5 mins ago</div>
                </div>
              </div>
            </div>

            {/* Recent Games */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase">Recent Games</h3>
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-slate-400">vs WordMaster</div>
                <div className="text-slate-400">vs AcePlayz</div>
                <div className="text-slate-400">vs GameKnight</div>
              </div>
            </div>

            {/* Bottom User */}
            <div className="border-t border-slate-800 pt-2">
              <button className="flex items-center gap-2 w-full">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  Q
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold">QwithU</div>
                  <div className="text-xs text-slate-500">Rating 1550</div>
                </div>
              </button>
            </div>

            <button className="w-full text-slate-400 text-xs py-1 hover:text-slate-200">
              View all history
            </button>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 gap-3">
            {/* Board */}
            <div className="col-span-2">
              <div className="bg-slate-900 rounded-lg p-3 w-fit">
                <div className={`grid gap-0 p-1 rounded bg-slate-950`} style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}>
                  {board.map((type, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-900 border border-slate-800 ${getSquareColor(type)}`}
                    />
                  ))}
                </div>

                {/* Tile Rack */}
                <div className="mt-4 flex items-center justify-center gap-1 bg-slate-950 rounded-lg p-3 mb-4">
                  <div className="flex gap-1">
                    {tiles.map((tile, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 bg-amber-100 rounded flex items-center justify-center font-bold text-xs text-slate-900 cursor-pointer hover:opacity-75"
                      >
                        {tile}
                      </div>
                    ))}
                  </div>
                  <div className="ml-2 text-xs text-slate-400">{tilesLeft} tiles left</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2 text-slate-300 border-slate-700 hover:bg-slate-800 text-xs h-9">
                    <Shuffle className="w-3 h-3" />
                    Shuffle
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 text-slate-300 border-slate-700 hover:bg-slate-800 text-xs h-9">
                    <Hand className="w-3 h-3" />
                    Pass
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 text-slate-300 border-slate-700 hover:bg-slate-800 text-xs h-9">
                    <ArrowRightLeft className="w-3 h-3" />
                    Exchange
                  </Button>
                  <Button className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs h-9">
                    <Check className="w-3 h-3" />
                    Submit
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Opponent */}
              <div className="bg-slate-800/50 rounded p-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Opponent</h3>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center font-bold text-xs text-slate-900">
                    J
                  </div>
                  <div>
                    <div className="font-semibold text-xs">JohnDoe</div>
                    <div className="text-xs text-slate-500">Rating 1350</div>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="bg-slate-800/50 rounded p-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Score</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      QwithU (You)
                    </span>
                    <span className="font-bold">301</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      JohnDoe
                    </span>
                    <span className="font-bold">312</span>
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="bg-slate-800/50 rounded p-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Game Info</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Language</span>
                    <span>English</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dictionary</span>
                    <span>Collins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tiles Left</span>
                    <span>86</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Turn</span>
                    <span>Your turn</span>
                  </div>
                </div>
              </div>

              {/* Recent Moves */}
              <div className="bg-slate-800/50 rounded p-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Recent Moves</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span>JonDoe</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">T R A I N</span>
                      <span className="text-slate-600">14</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>QwithU</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">H E L D</span>
                      <span className="text-slate-600">12</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>JonDoe</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">G A M E</span>
                      <span className="text-slate-600">11</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>QwithU</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">W O R D</span>
                      <span className="text-slate-600">9</span>
                    </div>
                  </div>
                </div>
                <button className="w-full text-slate-500 text-xs py-1 hover:text-slate-300 mt-1">
                  View full history
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
