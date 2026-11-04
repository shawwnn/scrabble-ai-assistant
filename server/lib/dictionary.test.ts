import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createDictionary, DictionaryUnavailableError, loadDictionary } from "./dictionary";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createDictionary", () => {
  it("normalizes case and skips entries that are not plain letters", () => {
    const dictionary = createDictionary(["cat", " Ox ", "dog!", ""]);
    expect(dictionary.isWord("CAT")).toBe(true);
    expect(dictionary.isWord("OX")).toBe(true);
    expect(dictionary.isWord("DOG!")).toBe(false);
    expect(dictionary.isWord("DOG")).toBe(false);
  });

  it("does not treat a prefix as a word", () => {
    const dictionary = createDictionary(["PAINTER"]);
    expect(dictionary.isWord("PAINT")).toBe(false);
    expect(dictionary.isWord("PAINTER")).toBe(true);
  });
});

describe("loadDictionary", () => {
  it("reports a clear error when the word list is missing", () => {
    vi.stubEnv("DICTIONARY_DIR", mkdtempSync(path.join(tmpdir(), "empty-dict-")));
    expect(() => loadDictionary("NWL2023")).toThrow(DictionaryUnavailableError);
  });

  it("reads the word list from DICTIONARY_DIR", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "csw-dict-"));
    writeFileSync(path.join(directory, "CSW2024.txt"), "QI\r\nZA\r\n");
    vi.stubEnv("DICTIONARY_DIR", directory);
    const dictionary = loadDictionary("CSW2024");
    expect(dictionary.isWord("QI")).toBe(true);
    expect(dictionary.isWord("ZA")).toBe(true);
    expect(dictionary.isWord("XI")).toBe(false);
  });
});

const realListPath = path.resolve(process.cwd(), "dictionaries", "CSW2024.txt");
const realListPresent = existsSync(realListPath);

describe.skipIf(!realListPresent)(
  `CSW2024 word list${realListPresent ? "" : " (skipped until dictionaries/CSW2024.txt is provided)"}`,
  () => {
    let real: ReturnType<typeof createDictionary>;

    beforeAll(() => {
      real = createDictionary(readFileSync(realListPath, "utf8").split(/\r?\n/));
    });

    it("accepts common words", () => {
      expect(real.isWord("PAINTER")).toBe(true);
      expect(real.isWord("QI")).toBe(true);
    });

    it("rejects non-words", () => {
      expect(real.isWord("ZZZ")).toBe(false);
    });
  },
);
