# Root Directory Migration Report

Status: **Not ready for migration.** This report documents a read-only comparison. No code, configuration, Vercel settings, or dependencies were changed, and nothing was deployed, deleted, or pushed.

## 1. Scope and method

- Goal: move the Vercel Project Root Directory from `frontend-web/` to the repository root (`/`) without losing working UI, hooks, validation, or API behavior.
- Current Vercel Root Directory: `frontend-web/` (reported by the project owner).
- Method: comparison of user-pasted source snippets and file-path inventories. Direct reads of repository source are blocked by ACL. The ACL was not bypassed and reads were not retried.
- Pasted files reviewed:
  - Root `vite.config.ts`
  - `frontend-web/vite.config.ts`
  - Root `client/App.tsx`
  - `frontend-web/shared/integrations/useMoveValidation.ts`
  - Root `server/routes/analyze.ts`
  - Root `package.json` and `frontend-web/package.json`
  - `frontend-web/shared/api.ts`
  - A dictionary loader (unlabeled in the paste; it imports `DictionaryName` from `@shared/api`, so it is probably root `server/lib/dictionary.ts`, but this is **unconfirmed**)
  - `backend/src/routes/validateMove.ts`
- Files confirmed only by path existence (Glob): root analyzer components and pages under `client/components/analyzer/` and `client/pages/Analyzer*.tsx`, `client/hooks/useAnalyzerSuggestions.ts`, `client/lib/analyze-api.ts`, `client/lib/analyzer-demo.ts`, `server/lib/*`, `shared/*`, `backend/src/*`, `backend/data-dict/CSW2024.txt`, `backend/data-dict/NWL2023.txt`, `netlify/functions/api.ts`.

Anything not listed above is **unverified**.

## 2. Findings

### 2.1 Package manifests

- Scripts are identical in root and nested: `dev`, `build` (`build:client` then `build:server`), `build:client`, `build:server` (`vite build --config vite.config.server.ts`), `start`, `test`, `format.fix`, `typecheck`.
- Both declare `"packageManager": "pnpm@10.14.0"`. `code/AGENTS.md` also says to prefer pnpm.
- Dependency differences:
  - Root has `@supabase/supabase-js` ^2.116.0 in `dependencies`. Nested does not. The earlier request to deactivate Supabase in the MVP suggests this should be reviewed.
  - Nested has `tailwind-config-viewer` ^2.0.4 in `devDependencies`. Root does not.
  - `tsx` is ^4.20.3 in root and ^4.23.12 in nested.
- Lockfiles: root `package-lock.json` (about 4 KB) and nested `package-lock.json` (about 300 KB) are npm-style. With pnpm declared, a `pnpm-lock.yaml` is expected. Its presence is **unverified**. The authoritative lockfile needs to be chosen.
- Root `build:server` references `vite.config.server.ts`. Whether that file exists at root is **unverified**.

### 2.2 Vite configuration

| Area | Root `vite.config.ts` | `frontend-web/vite.config.ts` | Status |
|---|---|---|---|
| Dev port | 8080 | 8080 | Matches |
| `/api` proxy to `localhost:3000` | Absent | Present | **Difference** |
| `server.fs.allow` | `./client`, `./shared` | `.`, `./client`, `./shared` | **Difference** |
| `build.outDir` | `dist/spa` | `dist/spa` | Matches |
| Express dev middleware plugin | Yes | Yes | Matches |
| Aliases `@`, `@shared` | Yes | Yes | Matches |

Observations:
- Vite registers middleware from `configureServer` before its internal middleware, including the proxy. In both configs the Express app therefore handles `/api` first on port 8080, and the nested `/api` proxy to port 3000 is likely never reached for routes Express serves. This is based on Vite's documented ordering and has **not been tested**.
- The root config has no proxy. Whether root needs one depends on the previous point.
- The root `fs.allow` omits `.`. Its effect on the build is **unverified**.

### 2.3 Client routing (root `client/App.tsx`)

- Analyzer routes are under `/analyzer`. Gameplay routes sit under `AppShell`.
- All imported analyzer and `components/ui` modules exist by path.
- Compilation and rendering are **not tested**.

### 2.4 Move validation (`frontend-web/shared/integrations/useMoveValidation.ts` and `frontend-web/shared/api.ts`)

- `validateMoveBackend` posts to `${API_URL}/api/validate-move` with body `{ currentMoveTiles }`. It does not send `dictionary`, so the backend uses its default.
- `validateMoveBackend` returns `response.json()` without checking `response.ok`. If the server returns a non-JSON error page (for example Express's default HTML 500), `json()` rejects.
- **Likely defect (hook):** the hook's `.catch` is empty. A rejected request leaves `needsBackendValidation` true, so the hook keeps returning `status: "checking"`. Combined with the point above, this can be triggered by a backend error. Not reproduced.
- The hook's request-ID guard and position-keyed results are useful behaviors to keep.

### 2.5 Backend validation route (`backend/src/routes/validateMove.ts`)

- Imports `getWordsFromMove`, `checkWords`, `scoreMove` from `backend/src/game/`. It does not use the analyzer's dictionary loader.
- Default dictionary is `"UK"` (`dictionary ?? "UK"`). Whether a `UK` word list exists, and how it relates to CSW2024 and NWL2023, is **unverified**.
- No input schema validation. `currentMoveTiles.map` throws if the field is missing. A thrown error in an Express 5 handler produces the default error response, which is not JSON.
- Several `console.log` calls remain in the request path. These should be removed before deployment.
- How the router is mounted (path prefix) is **unverified**. The hook expects `/api/validate-move`.

### 2.6 Dictionary loader (unlabeled paste, probably `server/lib/dictionary.ts`)

- Imports `DictionaryName` from `@shared/api`. The nested `frontend-web/shared/api.ts` does **not** export `DictionaryName`. Either root `shared/api.ts` differs, or this import does not compile. Unverified.
- Supports `CSW2024` (parses `('WORD'` lines) and `NWL2023` (first token per line).
- Default directory is `path.resolve(moduleDir, "../../backend/data-dict")`. This resolves to the repo-root `backend/data-dict` when run from `dist/server/`. It breaks if `backend/` moves, and it is unverified in a Vercel function bundle, where file tracing must include the `.txt` files.
- Overridable with `DICTIONARY_DIR`. Missing files throw `DictionaryUnavailableError`, which the analyze route maps to 503.

### 2.7 Analyzer endpoint (root `server/routes/analyze.ts`)

- Express `RequestHandler` with Zod validation. Returns 400 on invalid input or analysis issues, and 503 when a dictionary is unavailable.
- Default dictionary `CSW2024`.
- Not shown to be a Vercel function. A wrapper or an `api/` entry point is needed. **Unverified.**

### 2.8 Architecture conflict

- Two validation and dictionary implementations exist: `backend/src/game/dictionary.ts` (validate-move, `UK` default) and the analyzer loader (`CSW2024`, `NWL2023`). The project plan requires one authoritative engine. This must be resolved before migration.

### 2.9 Secrets

- Root `.env` is reported as tracked in Git. Its contents were not read.
- Tracking `.env` should be reviewed separately.

## 3. Changes made

- None to source, configuration, dependencies, or Vercel settings.
- This report is the only file added.

## 4. Tests and builds

- No build, typecheck, lint, or test was run.
- Builds were not run because they would read the ACL-blocked source. Running them is recommended once access is restored.
- Root build status: **unverified**.
- `frontend-web` build status: **unverified**.

## 5. Blockers

1. ACL blocks reading repository source. Only pasted snippets are verified.
2. Root and nested builds have not run.
3. Lockfile choice is open: two npm-style lockfiles exist while pnpm is declared.
4. `DictionaryName` export mismatch and the `"UK"` vs CSW/NWL dictionary split need resolution.
5. Vercel function compatibility for `/api/*` routes is unknown. Dictionary file bundling is unknown.
6. The hook's failure state and the validate-move error path need a fix before migration (see 2.4 and 2.5).

## 6. Deployment readiness

**Not ready.** Changing the Root Directory now could:
- break `/api/validate-move`, which the nested hook calls, if the backend route is not reachable from root,
- change `/api` behavior in dev because the nested proxy is missing at root,
- fail to bundle dictionary files for the analyzer,
- fail on a missing `vite.config.server.ts` or lockfile mismatch,
- deploy a root build that has never been run.

## 7. Rollback considerations

- Keep `frontend-web/` in place until the root app is verified.
- Before changing the Vercel Root Directory, record the current value (`frontend-web/`), the Output Directory, and the current production deployment ID so the change can be reverted in the Vercel dashboard.
- Do not delete `frontend-web/` as part of this migration.

## 8. Recommended next steps

1. Restore read access to `code/`, or confirm which remaining files to paste: root `shared/api.ts`, root `server/index.ts`, the `backend/src/game/dictionary.ts` file, and the `UK` word list details.
2. Run the root build and the nested build with pnpm, and record results.
3. Choose one lockfile (pnpm, per the declared `packageManager`) and one dictionary and validation engine.
4. Decide the `/api` routing approach, then confirm Vercel API entry points for `/api/analyze` and `/api/validate-move`.
5. Fix the validation hook's failure state (empty `.catch`) and make `validateMoveBackend` check `response.ok` in a separate, reviewed change.
6. Remove debug `console.log` calls from `validateMove.ts`.
7. Only after the above, change the Vercel Root Directory, with explicit approval.
