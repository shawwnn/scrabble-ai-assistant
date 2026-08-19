Inspect the existing Builder.io frontend and find the simplest way to capture the **coordinates/keys and letters of the tiles involved in the current move**, using the existing `pendingKeys` and `affectedKeys`.

In my mind, not your codebase, The existing validation flow already has a `useEffect` similar to:

```ts
useEffect(() => {
  validateMoveBackend({ board, pending, affected, tiles });
}, [board, pending, affected, tiles]);
```

Use this existing `useEffect` as the preferred integration point if appropriate. It is acceptable to append the required derived data there rather than creating another hook.

### Goal

For the current turn, obtain the tiles represented by:

```text
pendingKeys + affectedKeys
```

and capture their:

```text
coordinate/key + actual letter/tile
```

This data will eventually be passed to the backend so it can construct the **word or multiple words** created by the move.

Conceptually:

```ts
[
  { key: "7-7", letter: "A" },
  { key: "7-8", letter: "T" },
  { key: "7-9", letter: "E" },
];
```

Use the project's existing board/tile structures and lookup logic; do not assume this exact format.

### Implementation preference

Before adding new state, check whether the data can simply be derived inside the existing validation flow:

```text
board + pending
↓
existing pendingKeys / affectedKeys
↓
lookup corresponding board tiles/letters
↓
combined coordinates + letters
↓
available alongside validateMoveBackend()
```

If this can be done inside the existing `useEffect`, prefer that.

Only create a new `useState` if the data genuinely needs to persist outside the effect or be consumed elsewhere and cannot cleanly be derived/passed through an existing prop, callback, or function.

### Do not

- create `highlightedKeys`
- duplicate `pendingKeys` or `affectedKeys`
- create unnecessary hooks
- change the existing green/red border behavior
- rebuild the board state
- implement backend word-generation logic yet

First inspect the code and report the **minimal change and exact existing location** where this data can be captured. If the existing `useEffect` is the correct place, use it.

The desired flow is:

**tile placement → existing validation `useEffect` → existing `pendingKeys` + `affectedKeys` → retrieve coordinates + letters → make the data available for the backend API call.**
