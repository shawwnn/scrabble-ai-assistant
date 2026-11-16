export type MoveTile = {
  key: string;
  letter: string;
  tile: Record<string, unknown>;
};

export type FormedWord = {
  word: string;
  positions: string[];
  tiles: MoveTile[];
};

export function getWordsFromMove(moveTiles: MoveTile[]): FormedWord[] {
  const cells = new Map<string, MoveTile>();

  for (const tile of moveTiles) {
    cells.set(tile.key, tile);
  }

  const words: FormedWord[] = [];
  const seen = new Set<string>();

  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
  ];

  for (const tile of moveTiles) {
    const [row, col] = tile.key.split(",").map(Number) as [number, number];

    for (const [rowStep, colStep] of directions) {
      let startRow = row;
      let startCol = col;

      while (cells.has(`${startRow - rowStep},${startCol - colStep}`)) {
        startRow -= rowStep;
        startCol -= colStep;
      }

      const positions: string[] = [];
      const tiles: MoveTile[] = [];
      let word = "";

      while (cells.has(`${startRow},${startCol}`)) {
        const key = `${startRow},${startCol}`;
        const currentTile = cells.get(key)!;

        positions.push(key);
        tiles.push(currentTile);
        word += currentTile.letter;

        startRow += rowStep;
        startCol += colStep;
      }

      const hasPendingTile = tiles.some(
        (currentTile) => currentTile.tile?.pending === true,
      );

      if (positions.length >= 2 && hasPendingTile && !seen.has(word)) {
        seen.add(word);

        words.push({
          word,
          positions,
          tiles,
        });
      }
    }
  }

  return words;
}
