You're right. Based on the three files you've already established, the task is **only to design `useMoveValidation()` around the existing code**, not reopen the whole architecture.

## `useMoveValidation()` — agreed design

The hook should sit **between `Game.tsx` and `api.ts`** and expose exactly what `Game.tsx` needs to render the existing `ScrabbleBoard`.

```text
Game.tsx
   │
   │ board / pending / currentMoveTiles
   ▼
useMoveValidation()
   │
   ├── existing local validateMove()
   │       └── immediate fallback
   │
   └── validateMoveBackend()
           └── backend authoritative result
                    │
                    ▼
             effective validation
                    │
                    ├── status
                    └── score
                    │
                    ▼
             ScrabbleBoard.tsx
```

### 1. `api.ts` stays responsible for communication

No validation logic goes here.

It already has:

```ts
validateMoveBackend(...)
```

The hook calls it and receives the backend response.

---

### 2. `useMoveValidation()` owns the asynchronous state

Conceptually, the hook maintains:

```ts
backendValidation;
```

and exposes:

```ts
{
  (status, moveScore);
}
```

The important behavior is:

```text
No backend response yet
        ↓
use existing local validation

Backend response arrives
        ↓
use backend status
use backend totalProjectedScore
```

So the hook is **not another validator**.

It is a **bridge between the existing local UI state and the backend result**.

---

### 3. `Game.tsx` changes minimally

Currently, `Game.tsx` effectively has:

```ts
validation;
```

and passes values derived from it to:

```ts
<ScrabbleBoard
  validationStatus={...}
  moveScore={...}
  affectedKeys={...}
/>
```

We introduce:

```ts
const moveValidation = useMoveValidation(...)
```

Then the existing props become:

```ts
<ScrabbleBoard
  validationStatus={moveValidation.status}
  moveScore={moveValidation.moveScore}
  affectedKeys={...}
/>
```

The key point:

**We are targeting the values already being passed to `ScrabbleBoard`, not redesigning `ScrabbleBoard`.**

---

### 4. `ScrabbleBoard.tsx` should remain essentially untouched

It already knows how to display:

```ts
validationStatus;
moveScore;
affectedKeys;
```

So we don't need to teach the board about:

- backend responses
- API calls
- asynchronous state
- dictionaries
- backend validation
- request timing

That all stays outside the board.

---

## The exact responsibility of the hook

I would define it this way:

> **`useMoveValidation()` receives the current move information, preserves the existing immediate frontend validation, calls the backend asynchronously, and exposes the backend result as the authoritative UI validation once it arrives.**

### Its output should be intentionally small:

```ts
{
  (status, moveScore);
}
```

Potentially the local `affectedKeys` can continue coming directly from the existing `validation` object in `Game.tsx` because it is unrelated to backend validity.

So the final composition is:

```text
                    Game.tsx
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
 existing local validation    useMoveValidation()
          │                         │
          │                  backend status
          │                  backend score
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
                ScrabbleBoard
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
            status    score   affectedKeys
```

---

## Final summary:

Yes. **We are clear.** And you're right that I was unnecessarily reopening decisions we had already settled.

Your design is:

> **Keep Builder.io's existing UI and local behavior. Add one custom hook that asynchronously receives the backend validation result and overrides the relevant local UI state with the backend result.**

### Final locked design

```text
Game.tsx
   │
   ├── existing local validation
   │      └── immediate UI behavior
   │
   └── useMoveValidation()
          │
          └── async validateMoveBackend()
                    │
                    ▼
              backend response
                    │
              ┌─────┴─────┐
              ▼           ▼
           status        score
         valid/invalid   totalProjectedScore
              │           │
              └─────┬─────┘
                    ▼
               Game.tsx
                    │
                    ▼
             ScrabbleBoard.tsx
```

### What we're actually changing

**`api.ts`**

- Already communicates with backend.
- No redesign.

**`useMoveValidation()`**

- New hook.
- Makes/handles the asynchronous backend validation.
- Receives the backend response.
- Exposes the backend `status` and `totalProjectedScore`.

**`Game.tsx`**

- Minimal integration.
- Existing local validation remains.
- Backend result overrides the corresponding local values when it arrives.

**`ScrabbleBoard.tsx`**

- **Do not modify the Builder.io UI/content.**
- It continues receiving its existing props and rendering them.

### The fundamental behavior

```text
LOCAL:
"Here's what the UI can show immediately."

BACKEND:
"Here's the authoritative validation and score."

UI:
"Okay, backend result arrived → use that."
```

No new validation algorithm.
No duplicated dictionary checking.
No `affectedKeys` redesign.
No Builder.io rewrite.
No architectural expansion.
