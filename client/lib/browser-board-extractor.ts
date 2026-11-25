import { createWorker } from "tesseract.js";
import type { BoardExtraction } from "@shared/image-extraction";
import { boardExtractionSchema } from "@shared/image-extraction";

const BOARD_SIZE = 15;
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
  const pixels = context.getImageData(size * 0.3, size * 0.3, size * 0.4, size * 0.4).data;
  let warm = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const [red, green, blue] = pixels.slice(index, index + 3);
    if (red > green + 12 && green > blue + 8) warm += 1;
  }
  return warm > pixels.length / 16;
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

  const boardSize = Math.min(source.width * 0.94, source.height * 0.8);
  const boardX = (source.width - boardSize) / 2;
  const boardY = source.height * 0.035;
  const cellSize = boardSize / BOARD_SIZE;
  const worker = await createWorker("eng");
  const board: BoardExtraction["board"] = [];

  try {
    const deadline = Date.now() + MAX_PROCESSING_MS;
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (Date.now() > deadline) throw new Error("Image processing timed out.");
        const cell = cropCanvas(source, boardX + col * cellSize + cellSize * 0.14, boardY + row * cellSize + cellSize * 0.14, cellSize * 0.72, cellSize * 0.72);
        if (!looksLikeTile(cell)) continue;
        const letter = await readSingleLetter(worker, cell);
        if (letter) board.push({ row, col, letter });
      }
    }

    const rack = (await worker.recognize(cropCanvas(source, 0, source.height * 0.82, source.width, source.height * 0.18))).data.text
      .toUpperCase().match(/[A-Z]/g)?.slice(0, 7) ?? [];
    return boardExtractionSchema.parse({ board, rack }) as BoardExtraction;
  } finally {
    await worker.terminate();
  }
}
