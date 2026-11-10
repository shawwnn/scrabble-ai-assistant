## Backend Validation — Current State & Next Step

Your `backend/src/game/rules.ts` is the **backend conversion of the existing frontend validation**. We should **continue it**, not create a separate validation system.

### Current structure

```text
backend/src/
├── game/
│   └── rules.ts        ← validateMove()
├── routes/
│   └── games.ts        ← POST /api/games/move
└── server.ts
```

### Already implemented

`rules.ts` currently handles:

- Pending tile detection
- Board + pending tile merging
- Basic connectivity
- Word extraction
- Basic premium handling
- Basic scoring

### Still needed

Complete the backend Scrabble validation with:

1. First-move center-square rule
2. Horizontal/vertical placement rule
3. No-gap/continuous placement rule
4. Correct word extraction
5. Dictionary validation
6. Correct Scrabble scoring
7. Rack/tile ownership validation
8. Bingo bonus
9. Blank-tile handling

### Architecture

Keep `rules.ts` as the main validation engine.

Later, if needed:

```text
backend/src/game/
├── rules.ts        ← move/rule validation
├── dictionary.ts   ← dictionary lookup
└── scoring.ts      ← scoring
```

`games.ts` should remain a thin API layer:

```text
POST /api/games/move
        ↓
games.ts
        ↓
validateMove()
        ↓
rules + dictionary + scoring
        ↓
validation result
        ↓
JSON response
```

**Next:** finish `validateMove()`'s Scrabble placement rules before connecting the frontend green/red borders.
