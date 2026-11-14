# Root Directory Migration Report

Status: **Not ready for migration.** This report documents a read-only comparison. No code, configuration, Vercel settings, or dependencies were changed, and nothing was deployed, deleted, or pushed.

## 1. Scope and method

- Goal: move the Vercel Project Root Directory from `frontend-web/` to the repository root (`/`) without losing working UI, hooks, validation, or API behavior.
- Current Vercel Root Directory: `frontend-web/` (reported by the project owner).
- Method: comparison of user-supplied source snippets and file-path inventories. Direct reads of the repository source were blocked by ACL (`No ACL rule found granting read permission`). Per instruction, the ACL was not bypassed and reads were not retried.
- Files reviewed through pasted snippets:
  - Root `vite.config.ts`
  - `frontend-web/vite.config.ts`
  - Root `client/App.tsx`
  - `frontend-web/shared/integrations/useMoveValidation.ts`
  - Root `server/routes/analyze.ts`
- Files confirmed only by path existence (Glob): root analyzer components and pages under `client/components/analyzer/` and `client/pages/Analyzer*.tsx`, `client/hooks/useAnalyzerSuggestions.ts`, `client/lib/analyze-api.ts`, `client/lib/analyzer-demo.ts`, `server/lib/*`, `shared/*`, `backend/src/*`, `backend/data-dict/CSW2024.txt`, `backend/data-dict/NWL2023.txt`, `netlify/functions/api.ts`.

Anything not listed above is **unverified**.

## 2. Findings

### 2.1 Vite configuration (from pasted snippets)

| Area | Root `vite.config.ts` | `frontend-web/vite.config.ts` | Status |
|---|---|---|---|
| Dev port | 8080 | 8080 | Matches |
| `/api` proxy to `localhost:3000` | Absent | Present | **Difference** |
| `server.fs.allow` | `./client`, `./shared` | `.`, `./client`, `./shared` | **Difference** (root omits `.`) |
| `build.outDir` | `dist/spa` | `dist/spa` | Matches |
| Express dev middleware plugin | Yes (`createServer` from `./server`) | Yes (`createServer` from `./server`) | Matches |
| Aliases `@`, `@shared` | Yes | Yes | Matches |

Observations:
- The root config has no `/api` proxy. If the root app must call a separate API process in dev, this needs to be added or the Express middleware must serve those routes. Not verified.
- The nested config's proxy may be bypassed if the Express middleware handles `/api` first. This is a hypothesis and has not been tested.
- The root `fs.allow` omits `.`. This may matter if the build or dev server reads files outside `client/` and `shared/`. Not verified.

### 2.2 Client routing (root `client/App.tsx`)

- Analyzer routes are registered under `/analyzer`, and gameplay routes sit under `AppShell`.
- All imported analyzer components and `components/ui` modules exist by path.
- Whether the app compiles and renders these routes has **not** been tested.

### 2.3 Move validation hook (`frontend-web/shared/integrations/useMoveValidation.ts`)

- Calls `validateMoveBackend` from `frontend-web/shared/api.ts`. That module is **not** in the pasted snippets, so its endpoint path and payload shape are unverified.
- Uses a request ID to discard stale responses and keys results by board position. These behaviors should be kept.
- **Likely defect:** the `.catch` handler is empty. If the request rejects, `needsBackendValidation` stays true and the hook keeps returning `status: "checking"`. This is inferred from the snippet and has not been reproduced.
- The backend route that answers this call is `backend/src/routes/validateMove.ts`, which is outside the root `server/` tree. Whether root code can reach it after migration is unverified.

### 2.4 Analyzer endpoint (root `server/routes/analyze.ts`)

- Written as an Express `RequestHandler` with Zod validation. It returns 400 on invalid input, 503 when a dictionary is unavailable, and 400 when analysis reports issues.
- Default dictionary is `CSW2024`.
- It is **not** shown to be a Vercel serverless function. Vercel deployment would need a wrapper or a `/api` function entry point. Not verified.
- The dictionary loader path and whether the `.txt` files are bundled into a Vercel function are unverified.

### 2.5 Dictionaries

- `backend/data-dict/CSW2024.txt` and `backend/data-dict/NWL2023.txt` exist by path.
- Whether the root analyzer loader points to these files, and whether they are available at runtime on Vercel, is unverified.

### 2.6 Package and build configuration

- Root `package-lock.json` is reported at about 4 KB. Nested `frontend-web/package-lock.json` is about 300 KB.
- Build scripts, dependency lists, and Node version pins for the root are **unverified**.
- Two lockfiles suggest two separate install trees. A single authoritative lockfile should be chosen before migration.

### 2.7 Secrets

- Root `.env` is reported as tracked in Git. Its contents were not read and are not included here.
- Tracking `.env` is a security concern and should be reviewed separately.

## 3. Changes made

- None to source, configuration, dependencies, or Vercel settings.
- This report file is the only file added.

## 4. Tests and builds

- No build, typecheck, lint, or test was run.
- No browser or preview test was run.
- Root build status: **unverified**.
- `frontend-web` build status: **unverified**.

## 5. Blockers

1. ACL denies read access to the repository source. Full comparison of `package.json`, `shared/api.ts`, the dictionary loader, and the backend validation route is not possible until access is granted.
2. Root build and dev-server behavior are untested.
3. Vercel function compatibility for `/api/*` routes is unknown.
4. Two lockfiles and two dependency trees need an authoritative choice.
5. The validation hook's failure state needs confirmation.

## 6. Deployment readiness

**Not ready.** Changing the Root Directory now could:
- break the `/api/validate-move` path used by the nested hook,
- remove the Vite `/api` proxy behavior the nested app may rely on,
- fail to bundle dictionary files for the analyzer endpoint,
- deploy a root build that has never been run.

## 7. Rollback considerations

- Keep `frontend-web/` in place until the root app is verified.
- Before changing the Vercel Root Directory, record the current value (`frontend-web/`), the current Output Directory, and the current production deployment ID so the change can be reverted in the Vercel dashboard.
- Do not delete `frontend-web/` as part of this migration.

## 8. Recommended next steps

1. Restore read access to the repository source, or paste `package.json` (root and nested), `frontend-web/shared/api.ts`, the root dictionary loader, and `backend/src/routes/validateMove.ts`.
2. Run the root build and the nested build locally and record results.
3. Decide on one authoritative lockfile and one authoritative `/api` routing approach.
4. Confirm the Vercel API entry-point strategy for `/api/analyze` and `/api/validate-move`.
5. Fix the validation hook's failure state (`.catch` should clear the `"checking"` state) in a separate, reviewed change.
6. Only after the above, change the Vercel Root Directory, with explicit approval.
