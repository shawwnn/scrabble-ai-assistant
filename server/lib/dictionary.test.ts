import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createDictionary, DictionaryUnavailableError, dictionaryPath, loadDictionary } from "./dictionary";

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

  it("reads CSW2024 table rows from DICTIONARY_DIR", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "csw-dict-"));
    writeFileSync(path.join(directory, "CSW2024.txt"), "--- Table: words ---\r\n('QI', 1, 2.0)\r\n('ZA', 1, 3.0)\r\n");
    vi.stubEnv("DICTIONARY_DIR", directory);
    const dictionary = loadDictionary("CSW2024");
    expect(dictionary.isWord("QI")).toBe(true);
    expect(dictionary.isWord("ZA")).toBe(true);
    expect(dictionary.isWord("XI")).toBe(false);
  });

  it("reads NWL2023 entries by their first word and ignores definitions", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "nwl-dict-"));
    writeFileSync(path.join(directory, "NWL2023.txt"), "AA rough, cindery lava [n AAS]\r\nQI a Chinese term\r\n");
    vi.stubEnv("DICTIONARY_DIR", directory);
    const dictionary = loadDictionary("NWL2023");
    expect(dictionary.isWord("AA")).toBe(true);
    expect(dictionary.isWord("QI")).toBe(true);
    expect(dictionary.isWord("ROUGH")).toBe(false);
  });

});

const realListPresent = existsSync(dictionaryPath("CSW2024"));

describe.skipIf(!realListPresent)("CSW2024 word list", () => {
  let real: ReturnType<typeof createDictionary>;

  beforeAll(() => {
    real = loadDictionary("CSW2024");
  });

  it("accepts common words", () => {
    expect(real.isWord("PAINTER")).toBe(true);
    expect(real.isWord("QI")).toBe(true);
  });

  it("rejects non-words", () => {
    expect(real.isWord("XQJ")).toBe(false);
  });
});
