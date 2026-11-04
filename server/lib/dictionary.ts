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

const FILE_NAMES: Record<DictionaryName, string> = {
  CSW2024: "CSW2024.txt",
  NWL2023: "NWL2023.txt",
};

const loaded = new Map<DictionaryName, Dictionary>();

export class DictionaryUnavailableError extends Error {}

export function dictionaryPath(name: DictionaryName): string {
  const directory = process.env.DICTIONARY_DIR ?? path.resolve(process.cwd(), "dictionaries");
  return path.join(directory, FILE_NAMES[name]);
}

export function loadDictionary(name: DictionaryName): Dictionary {
  const cached = loaded.get(name);
  if (cached) return cached;
  const file = dictionaryPath(name);
  if (!existsSync(file)) {
    throw new DictionaryUnavailableError(`Word list ${name} was not found at ${file}. Set DICTIONARY_DIR or add the file.`);
  }
  const dictionary = createDictionary(readFileSync(file, "utf8").split(/\r?\n/));
  loaded.set(name, dictionary);
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
