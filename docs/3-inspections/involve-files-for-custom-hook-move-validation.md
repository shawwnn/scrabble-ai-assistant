Yes. We now have the full communication path.

For the feature we're designing, these are the files/parts involved:

| File                                               | Role                                                              | Used?                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `backend/src/routes/validateMove.ts`               | Receives move → validates words → scores → returns backend result | ✅                                                         |
| `backend/src/game/words.ts`                        | Generates formed words and preserves tile metadata                | ✅                                                         |
| `backend/src/game/dictionary.ts`                   | Dictionary validation                                             | ✅                                                         |
| `backend/src/game/scoring.ts`                      | Backend scoring, blanks, premiums, bingo                          | ✅                                                         |
| `frontend-web/shared/api.ts`                       | Frontend → backend communication                                  | ✅                                                         |
| `frontend-web/client/pages/Game.tsx`               | Existing Builder.io game behavior + receives backend result       | ✅                                                         |
| `frontend-web/client/components/ScrabbleBoard.tsx` | Displays validation/scoring effects                               | ✅                                                         |
| `frontend-web/client/lib/game-data.ts`             | Existing frontend game logic, including current `validateMove()`  | ⚠️ Existing behavior; likely affected, but not decided yet |

### Communication path

```text
ScrabbleBoard
      ↓
Game.tsx
      ↓
validateMoveBackend()
      ↓
shared/api.ts
      ↓
POST /api/validate-move
      ↓
backend validateMove.ts
      ↓
words.ts
      ↓
dictionary.ts
      ↓
scoring.ts
      ↓
Backend response
      ↓
Game.tsx
      ↓
ScrabbleBoard
```

### Backend data currently available to the frontend

```ts
{
  status: "valid" | "invalid",
  totalProjectedScore: number,
  words: formedWords,
  invalidWords: string[],
  reason: string | null,
  dictionary: string
}
```

**One important observation:** the backend currently returns `totalProjectedScore`, but it does **not** return `affectedKeys`.

So we have identified the full existing communication chain, but we have **not yet decided how to integrate/override Builder.io's existing behavior**. That should be the next discussion—not brainstorming beyond the current architecture.
