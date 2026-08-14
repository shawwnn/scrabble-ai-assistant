export type BoardTile = {
  letter: string;
  points: number;
  pending?: boolean;
  preview?: boolean;
};

export type MoveValidation = {
  status: "unchanged" | "valid" | "invalid";
  reason: string;
  score: number;
  words: string[];
};

export type Board = Record<string, BoardTile>;

const tilePoints: Record<string, number> = {
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

export type Premium = "tw" | "dw" | "tl" | "dl" | "star" | null;

const premiumMap: Record<string, Premium> = {};

const setPremium = (type: Premium, coords: string[]) => {
  coords.forEach((coord) => {
    premiumMap[coord] = type;
  });
};

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

const getPremium = (row: number, col: number): Premium => {
  return (
    premiumMap[`${row},${col}`] ?? (row === 7 && col === 7 ? "star" : null)
  );
};

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

const inBounds = (row: number, col: number) => {
  return row >= 0 && row < 15 && col >= 0 && col < 15;
};

const keyOf = (row: number, col: number) => {
  return `${row},${col}`;
};

function getWord(
  cells: Board,
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

  while (inBounds(startRow, startCol)) {
    const tile = cells[keyOf(startRow, startCol)];

    if (!tile) {
      break;
    }

    positions.push(keyOf(startRow, startCol));
    word += tile.letter;

    startRow += rowStep;
    startCol += colStep;
  }

  return { word, positions };
}

export function validateMove(board: Board, pending: Board): MoveValidation {
  const pendingKeys = Object.keys(pending);

  if (!pendingKeys.length) {
    return {
      status: "unchanged",
      reason: "Place a tile to begin your move.",
      score: 0,
      words: [],
    };
  }

  const cells = {
    ...board,
    ...pending,
  };

  const touchesBoard = pendingKeys.some((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

    return directions.some(([dr, dc]) => {
      return board[keyOf(row + dr, col + dc)];
    });
  });

  const connected = pendingKeys.every((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

    return directions.some(([dr, dc]) => {
      const adjacentKey = keyOf(row + dr, col + dc);

      return cells[adjacentKey] && adjacentKey !== key;
    });
  });

  if (!touchesBoard || !connected) {
    return {
      status: "invalid",
      reason: "Every new tile must connect to the existing board.",
      score: 0,
      words: [],
    };
  }

  const words = new Set<string>();

  pendingKeys.forEach((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

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
      }
    }
  });

  if (!words.size) {
    return {
      status: "invalid",
      reason: "Your move must create at least one word.",
      score: 0,
      words: [],
    };
  }

  let score = 0;

  pendingKeys.forEach((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

    const premium = getPremium(row, col);

    const multiplier = premium === "dl" ? 2 : premium === "tl" ? 3 : 1;

    const tile = pending[key];
    if (!tile) return;

    score += (tile.points || tilePoints[tile.letter] || 0) * multiplier;
  });

  score *= pendingKeys.some((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

    return getPremium(row, col) === "dw";
  })
    ? 2
    : 1;

  return {
    status: "valid",
    reason: `${words.size} word${words.size === 1 ? "" : "s"} formed.`,
    score,
    words: [...words],
  };
}
