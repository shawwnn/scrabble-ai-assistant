import { describe, expect, test } from "vitest";
import { validateMove, type Board } from "../src/game/rules.js";

const tile = (letter: string, points: number) => ({
  letter,
  points,
  pending: true,
});

describe("validateMove", () => {
  test("returns unchanged when no tiles are pending", () => {
    const result = validateMove({}, {});

    expect(result.status).toBe("unchanged");
  });

  test("rejects first move when it does not cover center", () => {
    const pending: Board = {
      "7,4": tile("C", 3),
      "7,5": tile("A", 1),
      "7,6": tile("T", 1),
    };

    const result = validateMove({}, pending);

    expect(result.status).toBe("invalid");
    expect(result.reason).toBe("The first move must cover the center square.");
  });

  test("accepts a first move covering center", () => {
    const pending: Board = {
      "7,6": tile("C", 3),
      "7,7": tile("A", 1),
      "7,8": tile("T", 1),
    };

    const result = validateMove({}, pending);

    expect(result.status).toBe("valid");
    expect(result.words).toContain("CAT");
  });

  test("rejects diagonal placement", () => {
    const pending: Board = {
      "6,6": tile("C", 3),
      "7,7": tile("A", 1),
    };

    const result = validateMove({}, pending);

    expect(result.status).toBe("invalid");
    expect(result.reason).toBe(
      "Tiles must be placed in one row or one column.",
    );
  });

  test("accepts a vertical first move through center", () => {
    const pending: Board = {
      "6,7": tile("C", 3),
      "7,7": tile("A", 1),
      "8,7": tile("T", 1),
    };

    const result = validateMove({}, pending);

    expect(result.status).toBe("valid");
    expect(result.words).toContain("CAT");
  });

  test("rejects disconnected move", () => {
    const board: Board = {
      "7,7": {
        letter: "A",
        points: 1,
      },
    };

    const pending: Board = {
      "0,0": tile("C", 3),
    };

    const result = validateMove(board, pending);

    expect(result.status).toBe("invalid");
    expect(result.reason).toBe("Your move must connect to the existing board.");
  });

  test("accepts a tile directly connected to existing board", () => {
    const board: Board = {
      "7,7": {
        letter: "A",
        points: 1,
      },
    };

    const pending: Board = {
      "7,8": tile("T", 1),
    };

    const result = validateMove(board, pending);

    expect(result.status).toBe("valid");
    expect(result.words).toContain("AT");
  });

  test("rejects a gap between pending tiles", () => {
    const board: Board = {
      "7,7": {
        letter: "A",
        points: 1,
      },
    };

    const pending: Board = {
      "7,8": tile("C", 3),
      "7,10": tile("T", 1),
    };

    const result = validateMove(board, pending);

    expect(result.status).toBe("invalid");
    expect(result.reason).toBe("Your tiles must form a continuous placement.");
  });

  test("allows an existing board tile to bridge pending tiles", () => {
    const board: Board = {
      "7,7": {
        letter: "A",
        points: 1,
      },
    };

    const pending: Board = {
      "7,6": tile("C", 3),
      "7,8": tile("T", 1),
    };

    const result = validateMove(board, pending);

    expect(result.status).toBe("valid");
    expect(result.words).toContain("CAT");
  });

  test("detects a horizontal word", () => {
    const pending: Board = {
      "7,6": tile("C", 3),
      "7,7": tile("A", 1),
      "7,8": tile("T", 1),
    };

    const result = validateMove({}, pending);

    expect(result.words).toContain("CAT");
  });

  test("detects a vertical word", () => {
    const pending: Board = {
      "6,7": tile("C", 3),
      "7,7": tile("A", 1),
      "8,7": tile("T", 1),
    };

    const result = validateMove({}, pending);

    expect(result.words).toContain("CAT");
  });

  test("detects a word created using an existing tile", () => {
    const board: Board = {
      "7,7": {
        letter: "A",
        points: 1,
      },
    };

    const pending: Board = {
      "7,8": tile("T", 1),
    };

    const result = validateMove(board, pending);

    expect(result.words).toContain("AT");
  });
});
