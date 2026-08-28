### Where we stop backend

Your pipeline is now:

```text
Board / pending tiles
        ↓
POST /api/validate-move
        ↓
words.ts
        ↓
dictionary.ts
        ↓
scoring.ts
        ↓
JSON response
        ↓
{ status, score, words, invalidWords, ... }
```

If this JSON is correct, **freeze the backend for now**.

### Next: UI changes

We can do this in a very small sequence:

**1. Frontend calls backend**

```text
User places/moves tile
        ↓
validateMoveBackend(board, pending)
        ↓
backend JSON
```

**2. Frontend stores the result**

For example:

```text
status = "valid" | "invalid"
score = totalProjectedScore
```

**3. Board visual changes**

```text
valid   → GREEN border
invalid → RED border
unchanged → normal
```

And importantly, only the affected/newly placed tiles need the visual state if that's how your existing `affectedKeys` works.

**4. Score display changes**

Backend:

```json
{
  "status": "valid",
  "totalProjectedScore": 42
}
```

Frontend:

```text
Score: 42
```

**5. Submit button**

```text
valid   → enabled
invalid → disabled
unchanged → disabled
```

### So the implementation plan is simply

```text
BACKEND ✅
  ├─ Move extraction       ✅
  ├─ Word generation       ✅
  ├─ Dictionary validation ✅
  ├─ Scoring               ✅
  └─ JSON response         ✅
           ↓
FRONTEND ← YOU ARE HERE
  ├─ Call backend
  ├─ Read status
  ├─ Update board UI
  ├─ Update score
  └─ Enable/disable Submit
           ↓
TEST
  ├─ valid word
  ├─ invalid word
  ├─ cross-word
  ├─ blank tile
  └─ score/premiums
```

---

# shared/api.ts ROLE

Your decision is **mostly good**, but one weakness:

- `shared/api.ts` can become a **catch-all backend bridge**, mixing HTTP details with game logic.
- `game.tsx` may also become too responsible for validation state + UI state.

### Better minimal architecture

```text
client/
├── game.tsx          ← state/orchestration
├── ScrabbleBoard.tsx ← UI only
└── api/
    └── game.ts       ← backend communication

backend/
└── ...
```

**Alternative:** Keep `shared/api.ts` if it's already established and small. Don't refactor just for architecture purity.

**My recommendation:** **Keep `shared/api.ts` for now.** Your goal is minimal UI changes, and introducing another layer gives you complexity without much benefit.
