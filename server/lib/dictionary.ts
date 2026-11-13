import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DictionaryName } from "@shared/api";

export interface TrieNode {
  children: Map<string, TrieNode>;
  terminal: boolean;
}

export interface Dictionary {
  root: TrieNode;
  isWord(word: string): boolean;
}

const SOURCES: Record<DictionaryName, { file: string; parseLines: (contents: string) => string[] }> = {
  CSW2024: { file: "CSW2024.txt", parseLines: parseCswLines },
  NWL2023: { file: "NWL2023.txt", parseLines: parseNwlLines },
};

const loaded = new Map<string, Dictionary>();

export class DictionaryUnavailableError extends Error {}

export function dictionaryPath(name: DictionaryName): string {
  const directory = process.env.DICTIONARY_DIR ?? path.resolve(process.cwd(), "backend", "data-dict");
  return path.join(directory, SOURCES[name].file);
}

export function loadDictionary(name: DictionaryName): Dictionary {
  const file = dictionaryPath(name);
  const cached = loaded.get(file);
  if (cached) return cached;
  if (!existsSync(file)) {
    throw new DictionaryUnavailableError(`Word list ${name} was not found at ${file}. Set DICTIONARY_DIR or add the file.`);
  }
  const dictionary = createDictionary(SOURCES[name].parseLines(readFileSync(file, "utf8")));
  loaded.set(file, dictionary);
  return dictionary;
}

export function createDictionary(words: Iterable<string>): Dictionary {
  const root = createNode();
  for (const entry of words) {
    const word = entry.trim().toUpperCase();
    if (!/^[A-Z]+$/.test(word)) continue;
    let node = root;
    for (const letter of word) {
      let child = node.children.get(letter);
      if (!child) {
        child = createNode();
        node.children.set(letter, child);
      }
      node = child;
    }
    node.terminal = true;
  }
  return { root, isWord: (word) => findNode(root, word)?.terminal === true };
}

function parseCswLines(contents: string): string[] {
  return contents.split(/\r?\n/).flatMap((line) => {
    const match = /^\('([^']+)'/.exec(line);
    return match ? [match[1]] : [];
  });
}

function parseNwlLines(contents: string): string[] {
  return contents.split(/\r?\n/).flatMap((line) => {
    const word = line.trim().split(/\s+/)[0];
    return word ? [word] : [];
  });
}

function createNode(): TrieNode {
  return { children: new Map(), terminal: false };
}

function findNode(root: TrieNode, word: string): TrieNode | undefined {
  let node: TrieNode | undefined = root;
  for (const letter of word) {
    node = node.children.get(letter);
    if (!node) return undefined;
  }
  return node;
}
