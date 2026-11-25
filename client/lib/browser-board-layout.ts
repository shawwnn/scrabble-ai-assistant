export const BOARD_DIMENSION = 15;
export const RACK_DIMENSION = 7;

export interface BoardLayout {
  x: number;
  y: number;
  size: number;
  cellSize: number;
}

export interface ImageRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getBoardLayout(width: number, height: number): BoardLayout {
  const size = Math.min(width * 0.94, height * 0.8);
  return { x: (width - size) / 2, y: height * 0.035, size, cellSize: size / BOARD_DIMENSION };
}

export function getBoardCell(layout: BoardLayout, row: number, col: number): ImageRegion {
  const inset = layout.cellSize * 0.14;
  return {
    x: layout.x + col * layout.cellSize + inset,
    y: layout.y + row * layout.cellSize + inset,
    width: layout.cellSize * 0.72,
    height: layout.cellSize * 0.72,
  };
}

export function getRackTile(width: number, height: number, index: number): ImageRegion {
  const tileWidth = width / RACK_DIMENSION;
  return { x: tileWidth * index + tileWidth * 0.02, y: height * 0.86, width: tileWidth * 0.92, height: height * 0.12 };
}
