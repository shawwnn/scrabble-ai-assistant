### Step breakdown

**1. The original problem**
Explain that the old backend validation was receiving:

```text
board + pending
```

through `useEffect`.

**2. The new requirement**
You needed the backend/UI flow to know the **specific affected tiles and their coordinates**, including connected tiles.

Example:

```text
10,6 → E
10,7 → S
9,6  → A
11,6 → O
9,7  → R
```

**3. Create `currentMoveTiles` with `useMemo`**

```tsx
const currentMoveTiles = useMemo(() => {
  const cells = { ...board, ...pending };

  const keys = [
    ...new Set([...validation.affectedKeys, ...Object.keys(pending)]),
  ];

  return keys.flatMap((key) => {
    const tile = cells[key];

    return tile ? [{ key, letter: tile.letter, tile }] : [];
  });
}, [board, pending, validation.affectedKeys]);
```

Explain:

> `useMemo` derives the exact tiles we care about whenever the board, pending tiles, or affected keys change.

**4. The initial mistake/confusion**
You tried to pass `currentMoveTiles` directly into the existing API function and TypeScript complained because the function still expected:

```tsx
{
  (board, pending);
}
```

This is actually a useful part of the video because it shows how TypeScript exposed the mismatch.

**5. Update the API function**

Change the API function so it accepts `currentMoveTiles`.

Then the frontend can do:

```tsx
useEffect(() => {
  console.log("CURRENT MOVE TILES UPDATED:", currentMoveTiles);

  validateMoveBackend(currentMoveTiles);
}, [currentMoveTiles]);
```

**6. Explain why `useMemo` and `useEffect` work together**

This is probably the most educational part:

```text
board / pending / affectedKeys
            ↓
         useMemo
            ↓
    currentMoveTiles
            ↓
         useEffect
            ↓
      validateMoveBackend
            ↓
           fetch
            ↓
         backend
```

`useMemo` **prepares the data**.

`useEffect` **reacts to the new data and triggers the API call**.

**7. Verify the frontend**

Show the console:

```text
CURRENT MOVE TILES UPDATED:
[
  ...
]
```

**8. Verify the backend**

Show:

```text
BACKEND RECEIVED: {
  currentMoveTiles: [
    { key: '10,6', letter: 'E', tile: [Object] },
    { key: '10,7', letter: 'S', tile: [Object] },
    ...
  ]
}
```

Then optionally show:

```ts
console.log("BACKEND RECEIVED:", JSON.stringify(req.body, null, 2));
```

to reveal the complete nested tile objects.

---
