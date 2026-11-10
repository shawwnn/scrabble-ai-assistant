I already have an existing dictionary implementation. Do NOT recreate the dictionary loading/parsing logic.

Existing dictionary functionality:

```ts
export type DictionaryName = "US" | "UK";

export function initializeDictionary(name: DictionaryName): void;

export function isWordValid(name: DictionaryName, word: string): boolean;
```

It already:

- loads the dictionary files
- parses US/NWL2023
- parses UK/CSW2024
- stores words in memory using `Set<string>`
- normalizes dictionary words to uppercase
- validates individual words through `isWordValid()`
- throws an error if the dictionary has not been initialized

The new dictionary-validation layer must IMPORT and USE this existing functionality.

---

## Goal

Create:

```text
src/game/dictionary.ts
```

Its responsibility is to validate the words produced by `words.ts` against the selected Scrabble dictionary.

The pipeline is:

```text
words.ts
   ↓
["ES", "OR", "AEO"]
   ↓
dictionary.ts
   ↓
existing dictionary implementation
   ↓
ES    → found ✅
OR    → found ✅
AEO   → not found ❌
   ↓
INVALID
```

---

## Dictionary choice

The validator should accept a dictionary parameter.

There should be two supported dictionaries:

```ts
"CSW" | "NWL";
```

Recommended meaning:

```text
CSW = Collins Scrabble Words
      UK / International

NWL = NASPA Word List
      US / North American
```

The default dictionary must be:

```ts
CSW;
```

So callers can simply do:

```ts
validateWords(words);
```

and automatically use CSW.

They should also be able to explicitly choose:

```ts
validateWords(words, "CSW");
```

or:

```ts
validateWords(words, "NWL");
```

---

## Important naming consideration

The existing implementation currently uses:

```ts
type DictionaryName = "US" | "UK";
```

Do not blindly duplicate this type.

If necessary, update the existing dictionary type so the actual dictionary names are:

```ts
type DictionaryName = "CSW" | "NWL";
```

This is preferred because `"CSW"` and `"NWL"` identify the actual word lists, while `"UK"` and `"US"` describe regions.

If maintaining backwards compatibility with the existing code is important, create a clear mapping instead of duplicating dictionary logic.

For example conceptually:

```ts
CSW → UK / International → CSW2024.txt
NWL → US / North American → NWL2023.txt
```

---

## Responsibilities of dictionary.ts

`dictionary.ts` should:

1. Receive an array of words from `words.ts`.
2. Receive an optional dictionary selection.
3. Default to CSW.
4. Validate every word using the existing `isWordValid()` function.
5. Return whether all words are valid.
6. Return the invalid words so the caller knows exactly what failed.
7. Preserve the distinction between:
   - a word being invalid
   - the dictionary itself failing to initialize or load

---

## Suggested result

Use a structured result rather than returning only `true`/`false`.

Conceptually:

```ts
{
  valid: true,
  invalidWords: []
}
```

or:

```ts
{
  valid: false,
  invalidWords: ["AEO"]
}
```

Optionally include the selected dictionary:

```ts
{
  valid: false,
  invalidWords: ["AEO"],
  dictionary: "CSW"
}
```

---

## Valid example

Input:

```ts
validateWords(["ES", "OR"], "CSW");
```

Expected conceptual result:

```ts
{
  valid: true,
  invalidWords: [],
  dictionary: "CSW"
}
```

Meaning:

```text
ES → found ✅
OR → found ✅
→ VALID
```

---

## Invalid example

Input:

```ts
validateWords(["ES", "OR", "AEO"], "CSW");
```

Expected conceptual result:

```ts
{
  valid: false,
  invalidWords: ["AEO"],
  dictionary: "CSW"
}
```

Meaning:

```text
ES  → found ✅
OR  → found ✅
AEO → not found ❌
→ INVALID
```

If multiple words are invalid:

```ts
validateWords(["ES", "AEO", "ZZZZ"], "CSW");
```

Expected:

```ts
{
  valid: false,
  invalidWords: ["AEO", "ZZZZ"],
  dictionary: "CSW"
}
```

Return ALL invalid words rather than stopping at the first invalid word.

---

## Normalization

The existing `isWordValid()` already performs:

```ts
word.trim().toUpperCase();
```

Reuse that behavior rather than implementing a second normalization system.

For example:

```ts
"es"   → ES
" Es " → ES
"OR"   → OR
```

Do not modify internal characters.

For example:

```text
"E S" → do not transform into "ES"
"E-S" → do not transform into "ES"
```

The dictionary layer should rely on the existing dictionary lookup behavior.

---

## Edge cases

Consider explicitly:

### Empty array

```ts
validateWords([]);
```

Decide whether this layer should return:

```ts
{
  valid: false,
  invalidWords: []
}
```

or treat it as vacuously valid.

Prefer making this decision explicit based on the overall move-validation contract. The higher-level move validator may already guarantee that at least one word exists.

Do not silently invent Scrabble move rules inside this module.

### Empty string

```ts
validateWords([""]);
```

This should not be considered a valid dictionary word.

### Duplicate words

```ts
validateWords(["ES", "ES"]);
```

This should still produce a valid result if `ES` exists.

Deduplication is optional and should only be used as an optimization.

### Multiple invalid words

Return all invalid words:

```ts
{
  valid: false,
  invalidWords: ["AEO", "ZZZZ"]
}
```

### Dictionary not initialized

If the underlying `isWordValid()` throws:

```text
Dictionary CSW has not been initialized.
```

Do NOT convert that into:

```ts
valid: false;
```

A dictionary initialization/system failure is different from an invalid Scrabble word.

Allow the error to propagate or handle it explicitly as a server/system error.

---

## Initialization

Use the existing:

```ts
initializeDictionary(...)
```

function.

Do not load the dictionary file every time `validateWords()` is called.

The dictionary should be initialized once at application startup.

For example conceptually:

```text
server startup
      ↓
initializeDictionary("CSW")
      ↓
dictionary loaded into memory
      ↓
requests
      ↓
validateWords(...)
      ↓
isWordValid(...)
```

If supporting both dictionaries during the lifetime of the server, initialize both:

```ts
initializeDictionary("CSW");
initializeDictionary("NWL");
```

Then the validator can select between them.

---

## Architecture

Keep the responsibility boundaries:

```text
route
  ↓
move validation
  ↓
words.ts
  ↓
dictionary.ts
  ↓
existing data-lib/dictionary
  ↓
CSW2024.txt / NWL2023.txt
```

`words.ts` answers:

> What words were formed?

`dictionary.ts` answers:

> Are those words present in the selected dictionary?

The higher-level move validator answers:

> Is the entire move valid?

Do NOT put board rules, word extraction, scoring, or HTTP logic into `dictionary.ts`.

---

## Implementation requirement

Before writing code, inspect the existing dictionary module and use its real exported API.

Do not invent:

```ts
loadDictionary();
```

or another dictionary implementation if the existing module already provides:

```ts
initializeDictionary();
isWordValid();
```

The new layer should be a thin validation layer on top of the existing dictionary system.

Also add focused tests covering:

1. all words valid
2. one invalid word
3. multiple invalid words
4. lowercase input
5. whitespace around words
6. empty input
7. CSW selection
8. NWL selection
9. dictionary-not-initialized behavior
10. default dictionary behavior

The default must be:

```text
CSW
```

and the supported alternatives must be:

```text
CSW → Collins / UK / International
NWL → NASPA / US / North American
```
