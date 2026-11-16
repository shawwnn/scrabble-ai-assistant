# Scrabble AI Move Analyzer: implementation log

## Session: execute approved plan

### What was requested

Execute the approved Scrabble Analyzer plan (Phase 1: engine, then Phase 2: Gemini recognition and client page), and record each step in `docs/`.

### Steps taken

1. **Git state:** Branch `ai_main_33f23cf85eaf485ab322`, working tree clean at start, HEAD `02e6310`.
2. **Access:** Builder ACL denied reads of `server/lib/*.ts` at first. After you granted access, reads succeeded.
3. **Engine review:** The plan's engine files already exist: `server/lib/{board,dictionary,movegen,score,analyze}.ts`, `server/routes/analyze.ts`, `shared/{api,premiums,tiles}.ts`, and their tests. Reviewed each against plan steps 1 to 7.
4. **Supabase startup fix:** `server/db/supabase.ts` created its client at import time. Vite loads `server/index.ts` while loading `vite.config.ts`, so a missing `SUPABASE_URL` broke config loading and Vitest startup. Changed it to a lazy `getSupabase()` accessor. Updated the nine call sites in `server/routes/games.ts`.
5. **Word-list loading:** `server/index.ts` loaded CSW2024 and NWL2023 inside `createServer()`. That made the analyze route test fail when `NWL2023.txt` was absent. Removed the two startup calls. The route already loads lists on request and returns 503 when one is missing.

### Verification

- `npx tsc --noEmit`: exit 0.
- `npx vitest --run`: 8 files, 47 tests, all passing. The real-CSW2024 bingo test runs (not skipped).

### Coverage against plan step 7

Covered by existing tests: empty-board seven-tile bingo, seven-tile extension to a nine-letter bingo, vertical and horizontal bingo, perpendicular cross-word rejection, bingo score with the 50-point bonus, and fallback to a play of six or fewer tiles.

6. **Ranking (bingo-first):** The code ranked by score alone, which conflicted with plan step 5. You chose bingo-first. `compareMoves` in `server/lib/analyze.ts` now sorts bingos ahead of non-bingo moves before comparing scores. The test in `server/lib/moves.test.ts` was updated to expect the bingo.

### Verification after ranking change

- `npx tsc --noEmit`: exit 0.
- `npx vitest --run`: 8 files, 47 tests, all passing.

### Not done

- Phase 2 (Gemini recognition, upload endpoint, client `Analyze` page) has not started. It needs a server-side Gemini API key, which is not configured.
- The Vite dev server preview was not re-checked in a browser. Vitest loads the same Vite config without error.
