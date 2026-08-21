# Wild Card Implementation

## Big Changes in Game.tsx and lib/game-data.tsx

---

## lib/game-data.tsx

You're right to question that. **I was too quick to say "mostly formatting."** Looking more carefully at the full diff, there are several potentially meaningful changes, and we should not assume they are harmless just because the lines are compressed.

For example, these are definitely functional:

- `wildcard?: boolean` was added to `Tile` and `BoardTile`.
- The rack changed from `N` to `?`, and the `?` is explicitly marked as a wildcard.
- `getUnseenCounts()` now treats wildcard tiles as `"?"` rather than their displayed letter.
- `replacementTiles()` now marks replacement `?` tiles as wildcards.

There are also **large sections where the logic appears unchanged but the formatting changed**, such as `validateMove()`. For example, the old multi-line condition and the new one-line condition are logically the same.

But your point is important: **we shouldn't label every other difference as formatting without actually checking it.**

One especially useful clue is this:

```text
@@ -1,354 +1,66 @@
```

That means the old file was **354 lines** in that diff region while the new file was only **66 lines** there. That's largely because the new file has been heavily compressed/formatted, **not because 288 lines of functionality necessarily disappeared**.

So the correct conclusion is:

> **There are multiple real code changes, not just the wildcard change. The rest need to be separated into "format-only" versus "behavior-changing" changes before deciding whether anything should be copied.**

If your goal is to make `scrbl` match `frontend-web` **except for the new game changes**, we should compare the two files specifically for **behavioral differences**, not just visually scan the `diff`.

Do you want **(1) a list of every functional change** or **(2) a list of only changes you should consider copying to `scrbl`**?

---

## Game.tsx

Yes — I went through the entire diff. The **meaningful changes** in `Game.tsx` are much fewer than the huge diff makes it look, because most of the file was merely reformatted/minified onto fewer lines.

The important functional changes are:

### 1. New wildcard/blank-tile functionality

**New state/entity:**

- `wildcardKey` — tracks which pending `?` tile is currently waiting for a letter.

**Modified `placeTile()` function:**

- Detects a wildcard tile (`tile.wildcard && tile.letter === "?"`).
- Opens the wildcard-selection flow instead of immediately returning the tile.
- Preserves `wildcard: true` when placing/returning a blank tile.

**New `chooseWildcardLetter()` function:**

- Takes the selected letter.
- Changes the pending blank tile's `letter`.
- Clears `wildcardKey`.
- Updates feedback.

**Modified `movePendingTile()`:**

- If the wildcard tile is dragged, its tracked location moves too.

**New UI:**

- A dialog containing A–Z buttons appears when a blank tile needs a letter.

**Bottom line:** this is a **real new game feature**, not formatting.

---

### 2. Replenishment count was changed

Previously:

`drawCount = Object.keys(pending).length`

Now:

`drawCount = replenishCount`

And `submitMove()` explicitly saves the number of tiles played into `replenishCount`.

Then `drawRandom()` and `confirmManual()` reset `replenishCount` back to `0`.

**Why this matters:** after submitting, `pending` is immediately cleared. Therefore the new state preserves **how many tiles need to be replenished** after the move is submitted.

This is a **functional change**.

---

### 3. Wildcard handling was added to manual rack replenishment

`confirmManual()` now recognizes `"?"` as a wildcard and adds:

`wildcard: true`

to that tile.

So blank tiles drawn from the bag are now explicitly identified as wildcards.

---

### 4. Undo now understands wildcard tiles

The "Undo last tile" logic was changed so that if the undone tile was a wildcard, it gets returned to the rack as:

- `letter: "?"`
- `wildcard: true`

It also clears `wildcardKey` when appropriate.

That's another **real functional change**.

---

### 5. Passing a turn now clears wildcard state

The Pass Turn action changed from clearing only `pending` to clearing:

- `pending`
- `wildcardKey`

before passing.

That's a small but legitimate state-management fix associated with the new wildcard feature.

---

### 6. Backend validation was REMOVED

This is an important one from your earlier work.

The old file had:

- `useEffect`
- `validateMoveBackend`
- a call to `validateMoveBackend(currentMoveTiles)`

Those were removed.

The import was also removed:

`import { validateMoveBackend } from "../../shared/api";`

So **`scrbl/Game.tsx` no longer performs that backend validation call**.

This is a **real functional change**, not formatting.

---

## What is NOT a meaningful change

A huge portion of this diff is just the same code compressed from:

```text
many lines
```

into:

```text
one very long line
```

For example, the `ScoreCard`, `Info`, `ScrabbleBoard`, move history, dialogs, etc. were largely reformatted this way. The underlying functionality is mostly the same.

So I would **not** count these as affected entities/functions:

- `ScoreCard` — formatting only
- `Info` — formatting only
- `ScrabbleBoard` usage — formatting only
- Move history — formatting only
- Menu sheet — formatting only
- Bag sheet — formatting only
- AI Hint sheet — formatting only
- Replenishment dialog — mostly formatting, **except** its `drawCount` now comes from the new `replenishCount`
- Exchange dialog — formatting only
- Selected-move dialog — formatting only

---

## One potentially important accidental change

There are two className changes in the new compressed JSX that look suspicious:

```text
borderp-2
```

instead of:

```text
border p-2
```

and:

```text
roundedbg-primary
```

instead of:

```text
rounded bg-primary
```

These appear in the **Tile Bag** and **AI Hint** UI respectively.

Those aren't indentation changes — they're actual class-name changes and could alter the styling.

---

## Final functional-change list

| Area               | Entity/function          | Change                          |
| ------------------ | ------------------------ | ------------------------------- |
| Backend validation | `validateMoveBackend`    | **Removed**                     |
| Backend validation | `useEffect`              | **Removed**                     |
| Wildcards          | `wildcardKey`            | **Added**                       |
| Wildcards          | `placeTile()`            | **Modified**                    |
| Wildcards          | `movePendingTile()`      | **Modified**                    |
| Wildcards          | `chooseWildcardLetter()` | **Added**                       |
| Wildcards          | wildcard dialog          | **Added**                       |
| Replenishment      | `replenishCount`         | **Added**                       |
| Replenishment      | `submitMove()`           | **Modified**                    |
| Replenishment      | `drawCount`              | **Changed source**              |
| Replenishment      | `drawRandom()`           | **Modified**                    |
| Replenishment      | `confirmManual()`        | **Modified**                    |
| Wildcards          | Undo                     | **Modified**                    |
| Wildcards          | Pass turn                | **Modified**                    |
| Styling            | Tile Bag `className`     | **Potential accidental change** |
| Styling            | AI Hint `className`      | **Potential accidental change** |

So if your goal is **"what actually needs to be copied from `scrbl/Game.tsx` into `frontend-web/Game.tsx`?"**, the key changes are the **wildcard system, replenish-count system, and removal of backend validation** — not the hundreds of lines that merely got reformatted.

Would you like me to isolate **only the exact code blocks you need to copy** (1), **only the wildcard changes** (2), or **only the backend-validation removal** (3)?
