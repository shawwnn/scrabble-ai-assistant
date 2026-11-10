You're right. The plan needs to specify the **expected output at every stage**, not just the responsibilities.

The complete pipeline should look like this:

```text
FRONTEND
   ↓
POST /api/moves/validate
   ↓
ROUTE
   ↓
MOVE VALIDATOR
   ↓
words.ts
   ↓
EXTRACTED WORDS
   ↓
dictionary.ts
   ↓
DICTIONARY RESULT
   ↓
VALIDATION RESULT
   ↓
API RESPONSE
   ↓
FRONTEND UI
```

### 1. Frontend input

Example:

```ts
currentMoveTiles = [
  { key: "10,6", letter: "E", tile: {...} },
  { key: "10,7", letter: "S", tile: {...} },
  { key: "9,6",  letter: "A", tile: {...} },
  { key: "11,6", letter: "O", tile: {...} },
  { key: "9,7",  letter: "R", tile: {...} }
]
```

**Expected output sent to backend:**

```json
{
  "currentMoveTiles": [
    { "key": "10,6", "letter": "E" },
    { "key": "10,7", "letter": "S" },
    { "key": "9,6", "letter": "A" },
    { "key": "11,6", "letter": "O" },
    { "key": "9,7", "letter": "R" }
  ]
}
```

---

### 2. `words.ts`

Input:

```text
currentMoveTiles
```

Its job:

> Determine every Scrabble word formed by those tiles.

**Expected output:**

```ts
["ES", "OR", "AEO"];
```

Or, preferably, a structured result:

```ts
{
  words: ["ES", "OR", "AEO"];
}
```

The important thing is:

```text
currentMoveTiles
       ↓
    words.ts
       ↓
["ES", "OR", "AEO"]
```

---

### 3. `dictionary.ts`

Input:

```ts
["ES", "OR", "AEO"];
```

with optional dictionary:

```ts
"CSW";
```

Default:

```ts
CSW;
```

It calls the existing dictionary implementation:

```text
dictionary.ts
      ↓
isWordValid("CSW", "ES")
isWordValid("CSW", "OR")
isWordValid("CSW", "AEO")
```

**Expected output:**

```ts
{
  valid: false,
  invalidWords: ["AEO"],
  dictionary: "CSW"
}
```

For a completely valid move:

```ts
["ES", "OR"];
```

expected:

```ts
{
  valid: true,
  invalidWords: [],
  dictionary: "CSW"
}
```

---

### 4. `validateMove()`

This combines the word extraction + dictionary result.

Input:

```ts
currentMoveTiles;
```

Internally:

```text
currentMoveTiles
      ↓
words.ts
      ↓
["ES", "OR", "AEO"]
      ↓
dictionary.ts
      ↓
{
  valid: false,
  invalidWords: ["AEO"]
}
```

**Expected final validation result:**

```ts
{
  valid: false,
  invalidWords: ["AEO"]
}
```

Or, if your API contract uses status strings:

```ts
{
  status: "INVALID",
  invalidWords: ["AEO"]
}
```

---

### 5. API route

The backend should return a clean API response.

#### Valid move

```json
{
  "valid": true,
  "invalidWords": [],
  "dictionary": "CSW"
}
```

#### Invalid move

```json
{
  "valid": false,
  "invalidWords": ["AEO"],
  "dictionary": "CSW"
}
```

The frontend should **not need to understand how CSW/NWL is parsed**.

---

### 6. Frontend

The frontend receives:

```json
{
  "valid": false,
  "invalidWords": ["AEO"]
}
```

and translates that into UI:

```text
INVALID
   ↓
red borders
   ↓
Submit disabled
```

For:

```json
{
  "valid": true,
  "invalidWords": []
}
```

it becomes:

```text
VALID
   ↓
green borders
   ↓
Submit enabled
```

---

# So the complete expected data flow is

```text
currentMoveTiles
[
  E,
  S,
  A,
  O,
  R
]
        ↓
     words.ts
        ↓
["ES", "OR", "AEO"]
        ↓
   dictionary.ts
        ↓
ES  → found ✅
OR  → found ✅
AEO → NOT FOUND ❌
        ↓
{
  valid: false,
  invalidWords: ["AEO"],
  dictionary: "CSW"
}
        ↓
   validateMove()
        ↓
{
  valid: false,
  invalidWords: ["AEO"]
}
        ↓
    API response
        ↓
{
  valid: false,
  invalidWords: ["AEO"]
}
        ↓
     FRONTEND
        ↓
🔴 INVALID
🔴 red affected borders
🚫 Submit disabled
```

And the valid path:

```text
currentMoveTiles
        ↓
     words.ts
        ↓
["ES", "OR"]
        ↓
   dictionary.ts
        ↓
ES → found ✅
OR → found ✅
        ↓
{
  valid: true,
  invalidWords: [],
  dictionary: "CSW"
}
        ↓
   validateMove()
        ↓
{
  valid: true,
  invalidWords: []
}
        ↓
    API response
        ↓
{
  valid: true,
  invalidWords: []
}
        ↓
     FRONTEND
        ↓
🟢 VALID
🟢 green affected borders
✅ Submit enabled
```

**That output contract is the piece the previous plan was missing.**
