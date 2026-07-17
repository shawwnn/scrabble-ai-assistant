export type Premium = "tw" | "dw" | "tl" | "dl" | "star" | null;
export type Tile = { letter: string; points: number; id: string };
export type GameSummary = { id: string; opponent: string; opponentInitial: string; score: string; turn: "Your turn" | "Their turn"; updated: string; progress: number };

export const tilePoints: Record<string, number> = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10 };
export const rack: Tile[] = ["A", "T", "R", "E", "L", "O", "N"].map((letter, i) => ({ letter, points: tilePoints[letter], id: `${letter}-${i}` }));
export const games: GameSummary[] = [
  { id: "wordmaster", opponent: "WordMaster", opponentInitial: "W", score: "301–289", turn: "Your turn", updated: "12 min ago", progress: 68 },
  { id: "alex", opponent: "AlexPlayz", opponentInitial: "A", score: "198–210", turn: "Their turn", updated: "Yesterday", progress: 42 },
  { id: "gameknight", opponent: "GameKnight", opponentInitial: "G", score: "366–310", turn: "Your turn", updated: "3 days ago", progress: 91 },
];
export const recentGames = [
  { opponent: "LexiQueen", result: "Won", score: "412–388", date: "Oct 24, 2024" },
  { opponent: "BoardBoss", result: "Lost", score: "276–301", date: "Oct 21, 2024" },
  { opponent: "WordSmith", result: "Won", score: "355–320", date: "Oct 18, 2024" },
  { opponent: "TileStorm", result: "Won", score: "420–402", date: "Oct 11, 2024" },
];

const premiumMap: Record<string, Premium> = {};
const setPremium = (type: Premium, coords: string[]) => coords.forEach((coord) => (premiumMap[coord] = type));
setPremium("tw", ["0,0","0,7","0,14","7,0","7,14","14,0","14,7","14,14"]);
setPremium("dw", ["1,1","2,2","3,3","4,4","10,10","11,11","12,12","13,13","1,13","2,12","3,11","4,10","10,4","11,3","12,2","13,1"]);
setPremium("tl", ["1,5","1,9","5,1","5,5","5,9","5,13","9,1","9,5","9,9","9,13","13,5","13,9"]);
setPremium("dl", ["0,3","0,11","2,6","2,8","3,0","3,7","3,14","6,2","6,6","6,8","6,12","7,3","7,11","8,2","8,6","8,8","8,12","11,0","11,7","11,14","12,6","12,8","14,3","14,11"]);
export const getPremium = (row: number, col: number): Premium => premiumMap[`${row},${col}`] ?? (row === 7 && col === 7 ? "star" : null);
export const seededTiles: Record<string, string> = { "7,5": "W", "7,6": "O", "7,7": "R", "7,8": "D", "7,9": "S", "5,7": "A", "6,7": "I", "8,7": "E", "9,7": "R", "10,7": "S", "4,7": "T" };
export const suggestions = [
  { word: "RELATION", score: 78, note: "Uses all 7 tiles" },
  { word: "ORIENTAL", score: 64, note: "Strong board position" },
  { word: "TREASON", score: 52, note: "Opens a double word" },
  { word: "LEARN", score: 38, note: "Safe and flexible" },
  { word: "LATER", score: 32, note: "Leaves good rack balance" },
];
