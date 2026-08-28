// frontend-web/client/lib/game-data.ts

export type Tile = {
  letter: string;
  points: number;
  id: string;
  wildcard?: boolean;
};
export type Premium = "tw" | "dw" | "tl" | "dl" | "star" | null;
export type BoardTile = {
  letter: string;
  points: number;
  pending?: boolean;
  wildcard?: boolean;
};
export type GameSummary = {
  id: string;
  opponent: string;
  opponentInitial: string;
  score: string;
  turn: "Your turn" | "Their turn";
  updated: string;
  progress: number;
};

export const tilePoints: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  "?": 0,
};
export const standardTileDistribution: Record<string, number> = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
  "?": 2,
};
export const rack: Tile[] = ["A", "T", "R", "E", "L", "O", "?"].map(
  (letter, i) => ({
    letter,
    points: tilePoints[letter],
    id: `${letter}-${i}`,
    ...(letter === "?" ? { wildcard: true } : {}),
  }),
);

export const opponentRack = ["J", "U", "D", "O", "R", "?", "?"];
export const games: GameSummary[] = [
  {
    id: "wordmaster",
    opponent: "WordMaster",
    opponentInitial: "W",
    score: "301–289",
    turn: "Your turn",
    updated: "12 min ago",
    progress: 68,
  },
  {
    id: "alex",
    opponent: "AlexPlayz",
    opponentInitial: "A",
    score: "198–210",
    turn: "Their turn",
    updated: "Yesterday",
    progress: 42,
  },
  {
    id: "gameknight",
    opponent: "GameKnight",
    opponentInitial: "G",
    score: "366–310",
    turn: "Your turn",
    updated: "3 days ago",
    progress: 91,
  },
];
export const recentGames = [
  {
    opponent: "LexiQueen",
    result: "Won",
    score: "412–388",
    date: "Oct 24, 2024",
  },
  {
    opponent: "BoardBoss",
    result: "Lost",
    score: "276–301",
    date: "Oct 21, 2024",
  },
  {
    opponent: "WordSmith",
    result: "Won",
    score: "355–320",
    date: "Oct 18, 2024",
  },
  {
    opponent: "TileStorm",
    result: "Won",
    score: "420–402",
    date: "Oct 11, 2024",
  },
];

const premiumMap: Record<string, Premium> = {};
const setPremium = (type: Premium, coords: string[]) =>
  coords.forEach((coord) => (premiumMap[coord] = type));
setPremium("tw", [
  "0,0",
  "0,7",
  "0,14",
  "7,0",
  "7,14",
  "14,0",
  "14,7",
  "14,14",
]);
setPremium("dw", [
  "1,1",
  "2,2",
  "3,3",
  "4,4",
  "10,10",
  "11,11",
  "12,12",
  "13,13",
  "1,13",
  "2,12",
  "3,11",
  "4,10",
  "10,4",
  "11,3",
  "12,2",
  "13,1",
]);
setPremium("tl", [
  "1,5",
  "1,9",
  "5,1",
  "5,5",
  "5,9",
  "5,13",
  "9,1",
  "9,5",
  "9,9",
  "9,13",
  "13,5",
  "13,9",
]);
setPremium("dl", [
  "0,3",
  "0,11",
  "2,6",
  "2,8",
  "3,0",
  "3,7",
  "3,14",
  "6,2",
  "6,6",
  "6,8",
  "6,12",
  "7,3",
  "7,11",
  "8,2",
  "8,6",
  "8,8",
  "8,12",
  "11,0",
  "11,7",
  "11,14",
  "12,6",
  "12,8",
  "14,3",
  "14,11",
]);
export const getPremium = (row: number, col: number): Premium =>
  premiumMap[`${row},${col}`] ?? (row === 7 && col === 7 ? "star" : null);
export const seededTiles: Record<string, string> = {
  "7,5": "W",
  "7,6": "O",
  "7,7": "R",
  "7,8": "D",
  "7,9": "S",
  "5,7": "A",
  "6,7": "I",
  "8,7": "E",
  "9,7": "R",
  "10,7": "S",
  "4,7": "T",
};

export const suggestions = [
  {
    word: "RELATION",
    score: 78,
    note: "Uses all 7 tiles",
    usage: "7 of 7 tiles",
    start: [7, 4] as [number, number],
    direction: "across" as const,
  },
  {
    word: "ORIENTAL",
    score: 64,
    note: "Strong board position",
    usage: "6 of 7 tiles",
    start: [6, 7] as [number, number],
    direction: "down" as const,
  },
  {
    word: "TREASON",
    score: 52,
    note: "Opens a double word",
    usage: "6 of 7 tiles",
    start: [7, 4] as [number, number],
    direction: "across" as const,
  },
  {
    word: "LEARN",
    score: 38,
    note: "Safe and flexible",
    usage: "5 of 7 tiles",
    start: [8, 7] as [number, number],
    direction: "down" as const,
  },
  {
    word: "LATER",
    score: 32,
    note: "Leaves good rack balance",
    usage: "5 of 7 tiles",
    start: [6, 6] as [number, number],
    direction: "across" as const,
  },
];

export const moveHistory = [
  {
    id: "move-14",
    player: "JohnDoe",
    word: "WORDS",
    score: 32,
    time: "8 min ago",
    turn: 14,
    direction: "Across",
    position: "H8–L8",
    tiles: ["W", "O", "R", "D", "S"],
  },
  {
    id: "move-13",
    player: "QwithU",
    word: "RELATE",
    score: 24,
    time: "14 min ago",
    turn: 13,
    direction: "Down",
    position: "H6–H11",
    tiles: ["R", "E", "L", "A", "T", "E"],
  },
  {
    id: "move-12",
    player: "JohnDoe",
    word: "RAIN",
    score: 18,
    time: "21 min ago",
    turn: 12,
    direction: "Across",
    position: "F4–I4",
    tiles: ["R", "A", "I", "N"],
  },
  {
    id: "move-11",
    player: "QwithU",
    word: "TILE",
    score: 16,
    time: "29 min ago",
    turn: 11,
    direction: "Down",
    position: "K10–K13",
    tiles: ["T", "I", "L", "E"],
  },
  {
    id: "move-10",
    player: "JohnDoe",
    word: "STAR",
    score: 22,
    time: "36 min ago",
    turn: 10,
    direction: "Across",
    position: "D7–G7",
    tiles: ["S", "T", "A", "R"],
  },
];

export function getUnseenCounts(
  board: Record<string, BoardTile>,
  playerRack: Tile[],
  otherRack: string[],
) {
  const counts = { ...standardTileDistribution };
  Object.values(board).forEach(({ letter, wildcard }) => {
    const inventoryLetter = wildcard ? "?" : letter;
    counts[inventoryLetter] = Math.max(0, (counts[inventoryLetter] ?? 0) - 1);
  });
  playerRack.forEach(({ letter, wildcard }) => {
    const inventoryLetter = wildcard ? "?" : letter;
    counts[inventoryLetter] = Math.max(0, (counts[inventoryLetter] ?? 0) - 1);
  });
  otherRack.forEach((letter) => {
    counts[letter] = Math.max(0, (counts[letter] ?? 0) - 1);
  });
  return counts;
}

export function replacementTiles(
  count: number,
  counts: Record<string, number>,
): Tile[] {
  const available = Object.entries(counts).flatMap(([letter, quantity]) =>
    Array.from({ length: quantity }, () => letter),
  );
  return available.slice(0, count).map((letter, index) => ({
    letter,
    points: tilePoints[letter],
    id: `${letter}-replacement-${Date.now()}-${index}`,
    ...(letter === "?" ? { wildcard: true } : {}),
  }));
}

export type MoveValidation = {
  status: "unchanged" | "valid" | "invalid";
  reason: string;
  score: number;
  words: string[];
  affectedKeys: string[];
};

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;
const inBounds = (row: number, col: number) =>
  row >= 0 && row < 15 && col >= 0 && col < 15;
const keyOf = (row: number, col: number) => `${row},${col}`;

function getWord(
  cells: Record<string, BoardTile>,
  row: number,
  col: number,
  rowStep: number,
  colStep: number,
) {
  let startRow = row;
  let startCol = col;
  while (
    inBounds(startRow - rowStep, startCol - colStep) &&
    cells[keyOf(startRow - rowStep, startCol - colStep)]
  ) {
    startRow -= rowStep;
    startCol -= colStep;
  }
  const positions: string[] = [];
  let word = "";
  while (inBounds(startRow, startCol) && cells[keyOf(startRow, startCol)]) {
    positions.push(keyOf(startRow, startCol));
    word += cells[keyOf(startRow, startCol)].letter;
    startRow += rowStep;
    startCol += colStep;
  }
  return { word, positions };
}

export function validateMove(
  board: Record<string, BoardTile>,
  pending: Record<string, BoardTile>,
): MoveValidation {
  const pendingKeys = Object.keys(pending);
  if (!pendingKeys.length)
    return {
      status: "unchanged",
      reason: "Place a tile to begin your move.",
      score: 0,
      words: [],
      affectedKeys: [],
    };
  const cells = { ...board, ...pending };
  const positions = pendingKeys.map((key) => {
    const [row, col] = key.split(",").map(Number);
    return { key, row, col };
  });
  const touchesBoard = positions.some(({ row, col }) =>
    directions.some(([dr, dc]) => board[keyOf(row + dr, col + dc)]),
  );
  if (!touchesBoard)
    return {
      status: "invalid",
      reason: "Your move must connect to an existing tile.",
      score: 0,
      words: [],
      affectedKeys: pendingKeys,
    };

  if (positions.length > 1) {
    const rows = new Set(positions.map(({ row }) => row));
    const cols = new Set(positions.map(({ col }) => col));
    if (rows.size > 1 && cols.size > 1)
      return {
        status: "invalid",
        reason: "New tiles must stay in one direction.",
        score: 0,
        words: [],
        affectedKeys: pendingKeys,
      };
    const isHorizontal = rows.size === 1;
    const ordered = [...positions].sort((a, b) =>
      isHorizontal ? a.col - b.col : a.row - b.row,
    );
    const start = isHorizontal ? ordered[0].col : ordered[0].row;
    const end = isHorizontal
      ? ordered[ordered.length - 1].col
      : ordered[ordered.length - 1].row;
    for (let offset = start; offset <= end; offset += 1) {
      const row = isHorizontal ? ordered[0].row : offset;
      const col = isHorizontal ? offset : ordered[0].col;
      if (!cells[keyOf(row, col)])
        return {
          status: "invalid",
          reason: "New tiles must form one contiguous line.",
          score: 0,
          words: [],
          affectedKeys: pendingKeys,
        };
    }
  }

  const words = new Set<string>();
  const affectedKeys = new Set<string>();
  pendingKeys.forEach((key) => {
    const [row, col] = key.split(",").map(Number);
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
    ] as const) {
      const word = getWord(cells, row, col, dr, dc);
      if (
        word.positions.length > 1 &&
        word.positions.some((position) => pending[position])
      ) {
        words.add(word.word);
        word.positions.forEach((position) => affectedKeys.add(position));
      }
    }
  });
  if (!words.size)
    return {
      status: "invalid",
      reason: "Your move must create at least one word.",
      score: 0,
      words: [],
      affectedKeys: pendingKeys,
    };

  let score = 0;
  pendingKeys.forEach((key) => {
    const [row, col] = key.split(",").map(Number);
    const premium = getPremium(row, col);
    const multiplier = premium === "dl" ? 2 : premium === "tl" ? 3 : 1;
    score +=
      (pending[key].points || tilePoints[pending[key].letter] || 0) *
      multiplier;
  });
  score *= pendingKeys.some((key) => {
    const [row, col] = key.split(",").map(Number);
    return getPremium(row, col) === "dw";
  })
    ? 2
    : 1;
  return {
    status: "valid",
    reason: `${words.size} word${words.size === 1 ? "" : "s"} formed.`,
    score,
    words: [...words],
    affectedKeys: [...affectedKeys],
  };
}
