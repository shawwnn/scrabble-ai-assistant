# Analyzer feature inspection and fix priorities

Read-only inspection of the move analyzer and the existing code it can reuse. The only command run was the server test suite (`pnpm vitest run server`). No source files were changed. The word lists in `code/backend/data-dict/` could not be read directly (they exceed the read size limit), so their formats come from the parser code that reads them.

## Verification

- `pnpm vitest run server`: 5 files, **22 passed, 3 skipped**. The skipped tests are the real-dictionary tests, which look for `code/dictionaries/CSW2024.txt`. That folder does not exist.
- Not run: the dev server, `/api/analyze` against real data, and the real CSW2024 or NWL2023 lists.

## What exists

### Analyzer engine (`code/server/lib/`)

| File | Status |
|---|---|
| `board.ts` | Builds the 15x15 grid. Rejects out-of-bounds tiles, duplicate coordinates, boards that miss the center square (7, 7), and disconnected groups. |
| `dictionary.ts` | Builds a trie from a plain word list. Keeps only lines matching `^[A-Z]+$`. Reads `DICTIONARY_DIR` or `code/dictionaries/`. Caches each list after loading. |
| `movegen.ts` | Searches horizontal and vertical plays from every start square. Uses perpendicular cross-check masks and walks existing board letters. Marks `bingo` when exactly 7 rack tiles are placed. |
| `score.ts` | Uses the shared premium table (`shared/premiums.ts`) and tile values (`shared/tiles.ts`). Premiums apply only to newly placed tiles. Scores cross-words. Adds 50 for a bingo. |
| `analyze.ts` | Rejects board words missing from the dictionary. Ranks bingo first, then score, row, column, direction, and word. Returns the top 5 suggestions and a one-line explanation. |

### API and client

- `POST /api/analyze` (`server/routes/analyze.ts`, registered in `server/index.ts`). Zod validates the body. Responds 400 on invalid input, 503 when the word list is missing, and 200 with `recommendation` and `suggestions`.
- Shared types are in `shared/api.ts`. `DICTIONARY_NAMES` is `CSW2024` or `NWL2023`.
- Client: `client/lib/analyze-api.ts` (fetch wrapper), `client/hooks/useAnalyzerSuggestions.ts`, and `client/pages/AnalyzerResults.tsx`. The hook still sends the fixed `DEMO_BOARD` and `DEMO_RACK`. The upload-to-results flow is not connected to the engine yet, which matches the plan.

### Tests

- `moves.test.ts` (7): fallback to a six-or-fewer play, five-tile play not counted as bingo, no-legal-play case, bingo ranked first and suggestion cap, perpendicular cross-word rejection, tie-break order.
- `bingo.test.ts` (3, 1 skipped): seven-tile empty-board bingo with score 74 including the bonus, bingo that extends `RE` into `REPAINTED`, real CSW list test (skipped).
- `dictionary.test.ts` (6, 2 skipped): case normalization, prefix is not a word, missing-file error, reading from `DICTIONARY_DIR`, real CSW list (skipped).
- `board.test.ts` and `analyze.test.ts` exist. I did not read them, so I make no claim about their contents beyond the pass result.

Gaps I can see in the tests I read:
- No bingo test that forms cross-words, or that extends an existing word vertically.
- No test with the real CSW2024 or NWL2023 list.
- No blank tile on the rack (the plan assumes none).

## Problems found

1. **The analyzer cannot load the supplied word lists.** `server/lib/dictionary.ts` expects one plain word per line in `code/dictionaries/`. The supplied files are in `code/backend/data-dict/`:
   - `CSW2024.txt` is a table dump. Rows look like `('AA', 2, ...)`.
   - `NWL2023.txt` has a word, then a definition, e.g. `AA rough, cindery lava [n AAS]`.

   The analyzer's filter drops every line that is not only letters, so it would load almost nothing from these files. The game backend parses them correctly in `code/backend/src/game/dictionary.ts`: NWL uses the first whitespace token, and CSW uses the regex `/^\('([^']+)'/`.

2. **The real-list tests point at a folder that does not exist.** `bingo.test.ts` and `dictionary.test.ts` both look for `code/dictionaries/CSW2024.txt`. They skip silently, so the engine has never been tested against a real dictionary.

3. **The game backend has an unused premium lookup.** `code/backend/src/game/scoring.ts` `getPremium()` always returns `undefined`, so `/api/validate-move` scores without premiums. Its scorer also compares against uppercase names (`"DL"`), while `code/backend/src/game/rules.ts` and `shared/premiums.ts` use lowercase (`"dl"`). A complete premium table already exists in two places, `rules.ts` and `shared/premiums.ts`. The game backend's `scoring.ts` is the one that is missing it.

4. **A second copy of the analyzer appears in the tree.** Searches return `scrabble-ai-assistant/server/...` next to `code/server/...`. The earlier deletion request covered `scrabble-ai-assistant/` inside `code/`, so the copy found here may be a different directory. It needs to be confirmed before anyone edits or deletes it.

5. **Unverified at scale.** Nothing has measured how long the first `/api/analyze` call takes with a 280,898-word list. Move generation runs a depth-first search from every start square, and the trie is built on first use. Both costs are unmeasured.

## Reuse map

| Need | Existing code to reuse | Notes |
|---|---|---|
| Premium squares | `shared/premiums.ts` | Already used by the analyzer. Could replace the stub in `backend/src/game/scoring.ts`. |
| Tile values | `shared/tiles.ts` | Already used by the analyzer. Duplicated in `backend/src/game/scoring.ts`. |
| Word-list parsing | `backend/src/game/dictionary.ts` (`parseUS`, `parseUK`) | Move into `shared/` and import from both servers. |
| Move-check rules | `backend/src/game/rules.ts` and `words.ts` | Game-only. Not needed for analyzer search. |
| Board-to-grid validation | `server/lib/board.ts` | Already in use. |
| Analyzer results UI | `client/pages/AnalyzerResults.tsx`, `components/analyzer/SuggestionList` | Only demo data today. |

## Prioritized fixes

Ordered by return for effort. Items 1 and 2 are the only ones needed for the analyzer to work on the supplied lists.

1. **Make the dictionary loader read the supplied formats.** Effort: small. Return: very high, because it unblocks the real-list tests and real bingo recommendations. Two options:
   - (a) Move `parseUS` and `parseUK` into `shared/` and call them from `server/lib/dictionary.ts`. Point the default directory at `code/backend/data-dict/`. Keeps one source of truth, but the server now parses a 63 MB file on first use.
   - (b) Generate plain one-word-per-line files once and store them in `code/dictionaries/`. Fast at runtime and keeps the analyzer parser simple, but it adds a generated copy that must be kept in sync.

   I recommend (a) because it reuses the parsers that already work. The `code/dictionaries/` assumption in the analyzer tests must change either way.

2. **Turn the skipped real-list tests on and time them.** Effort: small. Return: high. After fix 1, run the CSW and NWL tests and time the first `/api/analyze` call on an empty board. Record the result before tuning anything.

3. **Confirm the duplicate `scrabble-ai-assistant/` folder, then remove it if it is stale.** Effort: small. Return: medium, since it removes the risk of editing the wrong copy. This is a deletion, so it needs your confirmation first.

4. **Replace the premium stub in the game backend with the shared table.** Effort: small. Return: medium. Makes `/api/validate-move` score premiums correctly and removes a second premium list. This is outside the analyzer but reuses code that already exists.

5. **Add the missing bingo tests.** Effort: small. Return: medium. Cover a bingo that forms cross-words, a vertical extension of an existing word, and a regression test for the 50-point bonus on a board word.

6. **Decide on blank tiles for the rack.** Effort: medium. Return: medium. The plan assumes none. If blanks are needed, `RackSchema` and `movegen.ts` need a blank path, and scoring already gives blanks 0 points.

7. **Gemini screenshot recognition (plan phase 2).** Effort: large. Return: high, but only after items 1 to 3. It needs a server-side key and validation of the model's JSON before any board is built.

## Open questions

- Which dictionary option should be used for item 1: (a) shared parsers or (b) generated plain lists?
- Should the `scrabble-ai-assistant/` folder be deleted once confirmed to be stale?
- Should item 4 be done now, or kept out of scope while the analyzer is the focus?
