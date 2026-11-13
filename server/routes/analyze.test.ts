import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@shared/api";
import { createServer } from "../index";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "analyze-route-"));
  writeFileSync(path.join(directory, "CSW2024.txt"), "('RE', 2, 1.0)\n('REPAINTED', 9, 1.0)\n");
  vi.stubEnv("DICTIONARY_DIR", directory);
  server = createServer().listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

function post(body: unknown) {
  return fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze", () => {
  it("returns the bingo recommendation for a valid board and rack", async () => {
    const response = await post({
      board: [
        { row: 7, col: 6, letter: "R" },
        { row: 7, col: 7, letter: "E" },
      ],
      rack: ["P", "A", "I", "N", "T", "E", "D"],
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as AnalyzeResponse;
    expect(body.dictionary).toBe("CSW2024");
    expect(body.recommendation).toMatchObject({ word: "REPAINTED", bingo: true, score: 89 });
    expect(body.suggestions[0]).toMatchObject({ word: "REPAINTED", bingo: true, score: 89 });
  });

  it("rejects a rack with more than seven tiles", async () => {
    const response = await post({ board: [], rack: ["A", "B", "C", "D", "E", "F", "G", "H"] });
    expect(response.status).toBe(400);
    const body = (await response.json()) as AnalyzeErrorResponse;
    expect(body.issues?.length).toBeGreaterThan(0);
  });

  it("reports a missing word list as unavailable", async () => {
    const response = await post({ board: [], rack: ["A"], dictionary: "NWL2023" });
    expect(response.status).toBe(503);
  });
});
