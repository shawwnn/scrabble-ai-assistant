import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type DictionaryName = "US" | "UK";

export type DictionaryResult = {
  valid: boolean;
  invalidWords: string[];
  dictionary: DictionaryName;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dictionaryPaths: Record<DictionaryName, string> = {
  US: path.resolve(__dirname, "../../data-dict/NWL2023.txt"),
  UK: path.resolve(__dirname, "../../data-dict/CSW2024.txt"),
};

const dictionaries: Partial<Record<DictionaryName, Set<string>>> = {};

function parseUS(contents: string): Set<string> {
  const words = new Set<string>();

  for (const line of contents.split(/\r?\n/)) {
    const word = line.trim().split(/\s+/)[0];

    if (word) {
      words.add(word.toUpperCase());
    }
  }

  return words;
}

function parseUK(contents: string): Set<string> {
  const words = new Set<string>();

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\('([^']+)'/);

    if (match?.[1]) {
      words.add(match[1].toUpperCase());
    }
  }

  return words;
}

function loadDictionary(name: DictionaryName): Set<string> {
  const filePath = dictionaryPaths[name];

  if (!fs.existsSync(filePath)) {
    throw new Error(`Dictionary file not found for ${name}: ${filePath}`);
  }

  const contents = fs.readFileSync(filePath, "utf8");

  const words = name === "US" ? parseUS(contents) : parseUK(contents);

  if (words.size === 0) {
    throw new Error(`Dictionary ${name} is empty: ${filePath}`);
  }

  return words;
}

export function initializeDictionary(name: DictionaryName): void {
  dictionaries[name] = loadDictionary(name);
}

export function isWordValid(name: DictionaryName, word: string): boolean {
  const dictionary = dictionaries[name];

  if (!dictionary) {
    throw new Error(`Dictionary ${name} has not been initialized.`);
  }

  return dictionary.has(word.trim().toUpperCase());
}

/**
 * Validate all words extracted from the current move.
 *
 * Input:
 * ["ES", "OR", "AEO"]
 *
 * Output:
 * {
 *   valid: false,
 *   invalidWords: ["AEO"],
 *   dictionary: "UK"
 * }
 */
export function checkWords(
  name: DictionaryName,
  words: string[],
): DictionaryResult {
  const invalidWords = words.filter((word: string) => !isWordValid(name, word));

  return {
    valid: invalidWords.length === 0,
    invalidWords,
    dictionary: name,
  };
}
