## Scoring Engine Update — Compact Implementation Plan

```text
Dictionary Approved
        │
        │ INPUT:
        │ formedWords[]
        ▼
1. scoreMove()
   ├─ INPUT: all formed words with positions + tile metadata
   │
   ├─ For each formed word → scoreWord()
   │
   ├─ OUTPUT: individual word scores
   │
   ├─ Sum word scores
   │
   ├─ Count unique pending tiles
   │
   ├─ If 7 pending tiles → +50 bingo
   │
   └─ OUTPUT:
       {
         totalProjectedScore,
         words,
         bingo
       }
        │
        ▼
2. scoreWord()
   ├─ INPUT: one formed word + its tiles
   │
   ├─ For each tile:
   │    • Blank/wildcard → 0 points
   │    • Normal tile → TILE_POINTS[letter]
   │    • If pending → check board premium
   │    • Apply DL / TL / DW / TW
   │
   └─ OUTPUT: word score
        │
        ▼
3. validateMove.ts
   ├─ Receives ScoreResult
   │
   └─ OUTPUT: final API response
       {
         status: "valid",
         totalProjectedScore,
         words,
         invalidWords: [],
         reason: null,
         dictionary
       }
```

### Data flow

| Stage                   | Input                    | Output                   |
| ----------------------- | ------------------------ | ------------------------ |
| **Dictionary approved** | `formedWords`            | Valid words              |
| **`scoreMove()`**       | All `formedWords`        | `ScoreResult`            |
| **`scoreWord()`**       | One word + tiles         | Word score               |
| **Tile scoring**        | Tile metadata + letter   | Tile points              |
| **Premium handling**    | Pending tile + `key`     | Adjusted tile/word score |
| **Bingo calculation**   | Unique pending tile keys | `bingo: true/false`      |
| **Final API**           | `ScoreResult`            | JSON response            |

### Core scoring rule

```text
Tile
 ├─ wildcard / blank → 0
 └─ normal → letter points

Pending tile?
 └─ yes → board coordinate determines premium

All word scores
 └─ sum

7 unique pending tiles?
 └─ yes → +50
```

**Result:** `scoring.ts` is responsible only for converting **dictionary-approved `formedWords` → per-word scores → total projected score + bingo**. `validateMove.ts` remains the orchestrator.
