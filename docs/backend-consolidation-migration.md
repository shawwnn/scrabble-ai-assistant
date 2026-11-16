# Backend Consolidation

The root `server/` is now the active backend.

Migrated from `backend/`:

- Supabase client access to `server/db/supabase.ts`
- Game rules, scoring, word extraction, and game routes to `server/game/` and `server/routes/`
- Backend validation tests to `server/tests/`
- NWL2023 and CSW2024 dictionaries to `server/data-dict/`

The root server registers:

- `POST /api/analyze`
- `GET/POST /api/games/*`
- `POST /api/validate-move`

The duplicate dictionary implementation was removed. Game validation now uses
the shared server dictionary loader used by the Analyzer; legacy `US`/`UK`
request values are mapped to `NWL2023`/`CSW2024` at the route boundary.

The former `backend/` source and test files were removed after migration. Its
package metadata and generated artifacts remain temporarily for review before
the directory is deleted in a follow-up cleanup.
