import { createWorker, PSM } from "tesseract.js";
import type { BoardExtraction } from "@shared/image-extraction";
import { boardExtractionSchema } from "@shared/image-extraction";
import { BOARD_DIMENSION, RACK_DIMENSION, getBoardCell, getBoardLayout, getRackTile } from "@/lib/browser-board-layout";
import { straightenBoard } from "@/lib/browser-opencv";

const MAX_PROCESSING_MS = 45_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image could not be loaded.")); };
    image.src = url;
  });
}

function cropCanvas(source: HTMLCanvasElement, x: number, y: number, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  canvas.getContext("2d")!.drawImage(source, x, y, width, height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function looksLikeTile(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext("2d")!;
  const size = Math.min(canvas.width, canvas.height);
  const pixels = [
    context.getImageData(size * 0.12, size * 0.12, size * 0.18, size * 0.18).data,
    context.getImageData(size * 0.70, size * 0.12, size * 0.18, size * 0.18).data,
    context.getImageData(size * 0.12, size * 0.70, size * 0.18, size * 0.18).data,
    context.getImageData(size * 0.70, size * 0.70, size * 0.18, size * 0.18).data,
  ];
  let warm = 0;
  for (const patch of pixels) {
    for (let index = 0; index < patch.length; index += 4) {
      const [red, green, blue] = patch.slice(index, index + 3);
      if (red > 235 && green > 215 && blue > 175 && red > green + 4 && green > blue + 20) warm += 1;
    }
  }
  return warm > pixels.reduce((total, patch) => total + patch.length, 0) / 24;
}

function readSingleLetter(worker: Awaited<ReturnType<typeof createWorker>>, canvas: HTMLCanvasElement): Promise<string> {
  return worker.recognize(canvas).then(({ data }) => {
    const value = data.text.toUpperCase().match(/[A-Z]/)?.[0] ?? "";
    return value;
  });
}

export async function extractBoardFromImage(file: File): Promise<BoardExtraction> {
  const image = await loadImage(file);
  const source = document.createElement("canvas");
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;
  source.getContext("2d")!.drawImage(image, 0, 0);

  const boardCanvas = await straightenBoard(source);
  const layout = getBoardLayout(boardCanvas.width, boardCanvas.height);
  const worker = await createWorker("eng");
  const board: BoardExtraction["board"] = [];

  try {
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      tessedit_pageseg_mode: PSM.SINGLE_CHAR,
    });
    const deadline = Date.now() + MAX_PROCESSING_MS;
    for (let row = 0; row < BOARD_DIMENSION; row += 1) {
      for (let col = 0; col < BOARD_DIMENSION; col += 1) {
        if (Date.now() > deadline) throw new Error("Image processing timed out.");
        const region = getBoardCell(layout, row, col);
        const cell = cropCanvas(boardCanvas, region.x, region.y, region.width, region.height);
        if (!looksLikeTile(cell)) continue;
        const letter = await readSingleLetter(worker, cell);
        if (letter) board.push({ row, col, letter });
      }
    }

    const rack: string[] = [];
    for (let index = 0; index < RACK_DIMENSION; index += 1) {
      const region = getRackTile(source.width, source.height, index);
      const tile = cropCanvas(source, region.x, region.y, region.width, region.height);
      const letter = await readSingleLetter(worker, tile);
      if (letter) rack.push(letter);
    }
    return boardExtractionSchema.parse({ board, rack }) as BoardExtraction;
  } finally {
    await worker.terminate();
  }
}
