// import type { Board } from "./rules.js";

// const BOARD_SIZE = 15;

// const inBounds = (row: number, col: number) => {
//   return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
// };

// const keyOf = (row: number, col: number) => {
//   return `${row},${col}`;
// };

// function getWord(
//   cells: Board,
//   row: number,
//   col: number,
//   rowStep: number,
//   colStep: number,
// ) {
//   let startRow = row;
//   let startCol = col;

//   while (
//     inBounds(startRow - rowStep, startCol - colStep) &&
//     cells[keyOf(startRow - rowStep, startCol - colStep)]
//   ) {
//     startRow -= rowStep;
//     startCol -= colStep;
//   }

//   const positions: string[] = [];
//   let word = "";

//   while (inBounds(startRow, startCol)) {
//     const tile = cells[keyOf(startRow, startCol)];

//     if (!tile) {
//       break;
//     }

//     positions.push(keyOf(startRow, startCol));
//     word += tile.letter;

//     startRow += rowStep;
//     startCol += colStep;
//   }

//   return { word, positions };
// }

// export function getWordsFromMove(board: Board, pending: Board): string[] {
//   const cells: Board = {
//     ...board,
//     ...pending,
//   };

//   const words = new Set<string>();

//   Object.keys(pending).forEach((key) => {
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

//   return [...words];
// }
