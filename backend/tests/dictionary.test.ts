import { describe, expect, it } from "vitest";
import { initializeDictionary, isWordValid } from "../src/game/dictionary.js";

describe("Dictionary", () => {
  it("loads the US dictionary", () => {
    expect(() => initializeDictionary("US")).not.toThrow();
  });

  it("loads the UK dictionary", () => {
    expect(() => initializeDictionary("UK")).not.toThrow();
  });

  it("recognizes a valid word", () => {
    initializeDictionary("US");

    expect(isWordValid("US", "BED")).toBe(true);
  });

  it("rejects a word that is not in the dictionary", () => {
    initializeDictionary("US");

    expect(isWordValid("US", "XYZXYZ")).toBe(false);
  });

  it("normalizes words to uppercase", () => {
    initializeDictionary("US");

    expect(isWordValid("US", "bed")).toBe(isWordValid("US", "BED"));
  });
});
