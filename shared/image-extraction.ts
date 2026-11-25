import { z } from "zod";
import type { BoardTileInput } from "./api";

export const boardTileSchema = z.object({
  row: z.number().int().min(0).max(14),
  col: z.number().int().min(0).max(14),
  letter: z.string().regex(/^[A-Za-z]$/).transform((value) => value.toUpperCase()),
  blank: z.boolean().optional(),
});

export const boardExtractionSchema = z.object({
  board: z.array(boardTileSchema),
  rack: z.array(z.string().regex(/^[A-Za-z]$/).transform((value) => value.toUpperCase())).max(7),
}).superRefine((value, context) => {
  const positions = new Set<string>();
  for (const [index, tile] of value.board.entries()) {
    const position = `${tile.row},${tile.col}`;
    if (positions.has(position)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["board", index], message: "Duplicate board coordinate" });
    }
    positions.add(position);
  }
});

export type BoardExtraction = { board: BoardTileInput[]; rack: string[] };
