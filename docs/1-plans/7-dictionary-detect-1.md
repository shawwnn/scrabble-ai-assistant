Implement the dictionary validation layer for the Scrabble backend.

### Goal

Create:

`src/game/dictionary.ts`

This module receives the words extracted by `words.ts` and determines whether **every word exists in the selected Scrabble dictionary**.

### Dependency

The dictionary logic **must import and use** the existing dictionary implementation from:

`data-lib/dictionary`

Do not create another dictionary loader or duplicate the dictionary data.

### Pipeline

```text
words.ts
   ↓
["ES", "OR", "AEO"]
   ↓
dictionary.ts
   ↓
ES    → found ✅
OR    → found ✅
AEO   → not found ❌
   ↓
INVALID
```

### Responsibilities of `dictionary.ts`

1. Accept an array of extracted words.
2. Normalize words consistently before lookup.
   - Use uppercase for dictionary lookup.
   - Do not mutate the original input unnecessarily.

3. Check every word against `data-lib/dictionary`.
4. Return enough information for the validation layer to determine:
   - all words are valid → `VALID`
   - one or more words are invalid → `INVALID`

5. If possible, return the invalid words so the caller can provide useful debugging information.

Example conceptual result:

```ts
{
  valid: false,
  invalidWords: ["AEO"]
}
```

For:

```ts
["ES", "OR", "AEO"];
```

Expected result:

```ts
{
  valid: false,
  invalidWords: ["AEO"]
}
```

For:

```ts
["ES", "OR"];
```

Expected result:

```ts
{
  valid: true,
  invalidWords: []
}
```

### Important boundaries

`dictionary.ts` should NOT:

- determine where tiles were placed
- determine whether tiles are in a straight line
- determine whether the move touches another tile
- determine whether the center square is used
- extract words from the board
- calculate score
- modify the board
- handle HTTP requests
- contain Express route logic

Those responsibilities belong elsewhere.

### Edge cases to explicitly handle

Consider and test:

- empty word array
- empty string
- lowercase input such as `"es"`
- mixed case such as `"Es"`
- duplicate words
- multiple invalid words
- words containing unexpected characters
- whitespace around words such as `" ES "`
- already-uppercase words
- a single-word array
- a very large array of words

Decide the intended behavior for each case rather than silently guessing.

### Architecture

Keep the dependency direction:

```text
route
  ↓
move validation
  ↓
words.ts
  ↓
dictionary.ts
  ↓
data-lib/dictionary
```

Do not make `dictionary.ts` depend on the route or frontend.

### Testing

Add focused tests for the dictionary layer.

At minimum test:

1. all words exist
2. one word does not exist
3. multiple words do not exist
4. lowercase input
5. empty input
6. whitespace normalization
7. duplicate words

Use the project's existing test framework and follow the existing TypeScript conventions.

Before implementing, inspect `data-lib/dictionary` and determine its actual API. Do not invent an import or function name if one already exists.
