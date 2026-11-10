# CHECKPOINT — Continuous Word Validation

### Goal

Validate a Scrabble placement **continuously as the player places/moves tiles**, using the selected dictionary, and eventually use the result for the frontend **green/red tile borders**.

### Design

```text
Player places/moves tile
        ↓
Backend receives board + pending tiles
        ↓
Determine every word created by the placement
        ↓
Dictionary lookup for each word
        ↓
ALL words valid?
   ↓              ↓
 YES             NO
 GREEN           RED
```

### 1. Dictionary

We currently have:

```text
backend/data-dict/
├── CSW2024.txt   ← UK
└── NWL2023.txt   ← US
```

The user can select **US or UK dictionary** in settings.

The selected dictionary will be:

```text
loaded once at backend startup
        ↓
stored in memory
        ↓
used for fast lookups
```

Words are normalized to **uppercase**.

We do **not** reread the 60 MB file for every tile placement.

### 2. Dictionary failure

If the selected dictionary cannot be loaded:

```text
backend startup
      ↓
dictionary load fails
      ↓
handle/report startup failure
      ↓
do not silently continue with a broken validator
```

The exact error/UI handling can be implemented when we connect it.

### 3. What gets checked

We are **not simply checking the player's intended/main word**.

Every word produced by the current placement must be checked.

For example:

```text
Main word
   BED

Cross/adjacent words
   AB
   YE
```

The backend checks:

```text
BED → dictionary
AB  → dictionary
YE  → dictionary
```

If **all** are valid:

```text
VALID → GREEN
```

If **any one** is invalid:

```text
INVALID → RED
```

### 4. Continuous behavior

The check happens as the current placement changes.

Conceptually:

```text
C
↓
"C" → invalid → RED

CR
↓
"CR" → invalid → RED

CRY
↓
"CRY" → valid → GREEN
```

And when a placement creates additional words, those words are included in the validation too.

### 5. Existing backend responsibility

We already have:

```text
validateMove(board, pending)
```

in:

```text
src/game/rules.ts
```

That handles **Scrabble placement/move rules and identifies the words created**.

We are now adding the dictionary layer rather than replacing the existing rules.

### 6. Minimal architecture

```text
src/
├── game/
│   ├── rules.ts
│   └── dictionary.ts   ← dictionary loading + word lookup
│
└── routes/
    └── games.ts
```

Flow:

```text
POST /api/games/move
        ↓
validateMove()
        ↓
words[]
        ↓
dictionary validation
        ↓
valid / invalid
        ↓
API response
        ↓
frontend green/red feedback
```

### 7. What we are NOT doing yet

No:

- scoring redesign
- database
- RAG/AI
- dictionary API
- rereading the file per request
- unnecessary caching architecture
- frontend rewrite

**This checkpoint is specifically: placement → words → dictionary → valid/invalid → eventual green/red UI.**
