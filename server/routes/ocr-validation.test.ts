import { afterEach, describe, expect, it, vi } from "vitest";
import { recognizeBoard } from "./analyze";
import { analyzeBoard } from "../lib/analyze";
import { loadDictionary } from "../lib/dictionary";

const dictionary = loadDictionary("CSW2024");

const fixtures = [
  { name: "empty-board-1", imageData: "fixture-1", rack: "EASAFAZ", word: "FAZES" },
  { name: "empty-board-2", imageData: "fixture-2", rack: "YGSVEZO", word: "GYVES" },
  { name: "empty-board-3", imageData: "fixture-3", rack: "AITUJUD", word: "JUD" },
] as const;

afterEach(() => vi.restoreAllMocks());

describe("Gemini OCR validation fixtures", () => {
  it.each(fixtures)("recognizes $name and produces the expected move", async (fixture) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({
        board: [],
        rack: [...fixture.rack],
      }) }] } }],
    }), { status: 200, headers: { "content-type": "application/json" } }));

    const recognized = await recognizeBoard({ mimeType: "image/png", data: fixture.imageData });

    expect(recognized.board).toEqual([]);
    expect(recognized.rack).toEqual([...fixture.rack]);
    expect(recognized.rack).toHaveLength(7);

    const analysis = analyzeBoard(recognized.board, recognized.rack, dictionary);
    expect(analysis.issues).toEqual([]);
    expect(analysis.recommendation?.word).toBe(fixture.word);
    expect(analysis.suggestions[0]?.word).toBe(fixture.word);
  });
});
