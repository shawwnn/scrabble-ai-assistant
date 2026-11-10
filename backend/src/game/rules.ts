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

// export function validateMove(board: Board, pending: Board): MoveValidation {
//   const pendingKeys = Object.keys(pending);

//   if (!pendingKeys.length) {
//     return {
//       status: "unchanged",
//       reason: "Place a tile to begin your move.",
//       score: 0,
//       words: [],
//     };
//   }

//   const cells = {
//     ...board,
//     ...pending,
//   };

//   const touchesBoard = pendingKeys.some((key) => {
//     const [row, col] = key.split(",").map(Number) as [number, number];

//     return directions.some(([dr, dc]) => {
//       return board[keyOf(row + dr, col + dc)];
//     });
//   });

//   const connected = pendingKeys.every((key) => {
//     const [row, col] = key.split(",").map(Number) as [number, number];

//     return directions.some(([dr, dc]) => {
//       const adjacentKey = keyOf(row + dr, col + dc);

//       return cells[adjacentKey] && adjacentKey !== key;
//     });
//   });

//   if (!touchesBoard || !connected) {
//     return {
//       status: "invalid",
//       reason: "Every new tile must connect to the existing board.",
//       score: 0,
//       words: [],
//     };
//   }

//   const words = new Set<string>();

//   pendingKeys.forEach((key) => {
//     const [row, col] = key.split(",").map(Number) as [number, number];

//     for (const [dr, dc] of [
//       [0, 1],
//       [1, 0],
//     ] as const) {
//       const word = getWord(cells, row, col, dr, dc);

//       if (
//         word.positions.length > 1 &&
//         word.positions.some((position) => pending[position])
//       ) {
//         words.add(word.word);
//       }
//     }
//   });

//   if (!words.size) {
//     return {
//       status: "invalid",
//       reason: "Your move must create at least one word.",
//       score: 0,
//       words: [],
//     };
//   }

//   let score = 0;

//   pendingKeys.forEach((key) => {
//     const [row, col] = key.split(",").map(Number) as [number, number];

//     const premium = getPremium(row, col);

//     const multiplier = premium === "dl" ? 2 : premium === "tl" ? 3 : 1;

//     const tile = pending[key];
//     if (!tile) return;

//     score += (tile.points || tilePoints[tile.letter] || 0) * multiplier;
//   });

//   score *= pendingKeys.some((key) => {
//     const [row, col] = key.split(",").map(Number) as [number, number];

//     return getPremium(row, col) === "dw";
//   })
//     ? 2
//     : 1;

//   return {
//     status: "valid",
//     reason: `${words.size} word${words.size === 1 ? "" : "s"} formed.`,
//     score,
//     words: [...words],
//   };
// }

function invalidMove(reason: string): MoveValidation {
  return {
    status: "invalid",
    reason,
    score: 0,
    words: [],
  };
}

function getPendingPositions(pending: Board) {
  return Object.keys(pending).map((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

    return {
      key,
      row,
      col,
    };
  });
}

function validatePlacementDirection(pending: Board): MoveValidation | null {
  const positions = getPendingPositions(pending);

  if (positions.length <= 1) {
    return null;
  }

  const first = positions[0];

  if (!first) {
    return invalidMove("No pending tiles found.");
  }

  const sameRow = positions.every((position) => position.row === first.row);

  const sameColumn = positions.every((position) => position.col === first.col);

  if (!sameRow && !sameColumn) {
    return invalidMove("Tiles must be placed in one row or one column.");
  }

  return null;
}

function validateFirstMove(
  board: Board,
  pending: Board,
): MoveValidation | null {
  if (Object.keys(board).length > 0) {
    return null;
  }

  if (!pending["7,7"]) {
    return invalidMove("The first move must cover the center square.");
  }

  return null;
}

function validateConnection(
  board: Board,
  pending: Board,
): MoveValidation | null {
  if (Object.keys(board).length === 0) {
    return null;
  }

  const pendingKeys = Object.keys(pending);

  const touchesBoard = pendingKeys.some((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

    return directions.some(([dr, dc]) => {
      return Boolean(board[keyOf(row + dr, col + dc)]);
    });
  });

  if (!touchesBoard) {
    return invalidMove("Your move must connect to the existing board.");
  }

  return null;
}

function validateContinuity(
  board: Board,
  pending: Board,
): MoveValidation | null {
  const positions = getPendingPositions(pending);

  if (positions.length <= 1) {
    return null;
  }

  const cells: Board = {
    ...board,
    ...pending,
  };

  const first = positions[0];

  if (!first) {
    return invalidMove("No pending tiles found.");
  }

  const sameRow = positions.every((position) => position.row === first.row);

  const sorted = [...positions].sort((a, b) => {
    return sameRow ? a.col - b.col : a.row - b.row;
  });

  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];

    if (!previous || !current) {
      continue;
    }

    const rowStep = sameRow ? 0 : 1;
    const colStep = sameRow ? 1 : 0;

    let row = previous.row + rowStep;
    let col = previous.col + colStep;

    while (row !== current.row || col !== current.col) {
      if (!cells[keyOf(row, col)]) {
        return invalidMove("Your tiles must form a continuous placement.");
      }

      row += rowStep;
      col += colStep;
    }
  }

  return null;
}

function getWordsFromMove(board: Board, pending: Board): string[] {
  const cells: Board = {
    ...board,
    ...pending,
  };

  const words = new Set<string>();

  Object.keys(pending).forEach((key) => {
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

  return [...words];
}

function calculateScore(pending: Board): number {
  let score = 0;

  Object.keys(pending).forEach((key) => {
    const [row, col] = key.split(",").map(Number) as [number, number];

    const tile = pending[key];

    if (!tile) {
      return;
    }

    const premium = getPremium(row, col);

    const multiplier = premium === "dl" ? 2 : premium === "tl" ? 3 : 1;

    score += (tile.points || tilePoints[tile.letter] || 0) * multiplier;
  });

  const hasDoubleWord = Object.keys(pending).some((key) => {
    const [row, col] = key.split(",").map(Number);

    if (row === undefined || col === undefined) {
      return false;
    }

    return getPremium(row, col) === "dw";
  });

  if (hasDoubleWord) {
    score *= 2;
  }

  return score;
}

export function validateMove(board: Board, pending: Board): MoveValidation {
  if (!Object.keys(pending).length) {
    return {
      status: "unchanged",
      reason: "Place a tile to begin your move.",
      score: 0,
      words: [],
    };
  }

  const placementError = validatePlacementDirection(pending);

  if (placementError) {
    return placementError;
  }

  const firstMoveError = validateFirstMove(board, pending);

  if (firstMoveError) {
    return firstMoveError;
  }

  const connectionError = validateConnection(board, pending);

  if (connectionError) {
    return connectionError;
  }

  const continuityError = validateContinuity(board, pending);

  if (continuityError) {
    return continuityError;
  }

  const words = getWordsFromMove(board, pending);

  if (!words.length) {
    return invalidMove("Your move must create at least one word.");
  }

  const score = calculateScore(pending);

  return {
    status: "valid",
    reason: `${words.length} word${words.length === 1 ? "" : "s"} formed.`,
    score,
    words,
  };
}
