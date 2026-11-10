---

## Actual dictionary file formats

The dictionary files in this project are **not guaranteed to have the same structure**.

Before modifying or extending dictionary parsing, inspect the actual contents of:

```text
data-dict/CSW2024.txt
data-dict/NWL2023.txt
```

Do NOT assume that both files can be parsed with the same `.split()` logic.

The existing parser already reflects differences between the two sources, and this distinction must be preserved.

### CSW2024 format

The CSW2024 source in this project contains records that look like:

```text
('FOE', 3, 217522.0, 233, 233, 233, 192, 210, 195, 234, 464, 154, 152, 163, 486, 154, 152, 163, 'EFO', 1, 3, 2, 6, None, 'ns', 1, 0, None, 'enemy, opponent [n]')
('FOG', 3, 117151.0, 657, 657, 657, 48, 944, 884, 980, 140, 925, 922, 930, 153, 926, 923, 931, 'FGO', 1, 3, 1, 7, None, 'sy', 0, 0, None, 'mass of condensed water vapour in the lower air [n] / cover with steam [v]')
('FOH', 3, 201443.0, 275, 275, 275, 32, 1098, 1069, 1142, 104, 1098, 1083, 1120, 116, 1098, 1083, 1120, 'FHO', 1, 3, 1, 9, None, 'n', 1, 0, None, 'expression of disgust [interj]')
('FON', 3, 142866.0, 499, 499, 499, 96, 574, 505, 616, 248, 581, 568, 613, 264, 581, 568, 613, 'FNO', 1, 3, 1, 6, None, 'dest', 1, 0, None, 'compel [v]')
('FOO', 3, 161409.0, 420, 420, 420, 56, 819, 816, 829, 144, 911, 908, 921, 154, 912, 908, 922, 'FOO', 2, 2, 2, 6, None, 'dlst', 1, 0, None, 'temporary computer variable or file [n]')
('FOR', 3, 105916.0, 727, 727, 727, 96, 575, 505, 616, 248, 582, 568, 613, 264, 582, 568, 613, 'FOR', 3, 3, 1, 6, None, 'abdekmt', 1, 0, None, 'indicating benefit, receipt, timespan, distance, etc [prep]')
```

The important part for word validation is that the **first field is the headword**:

```text
('FOE', ...)
 ↑
 word
```

Therefore, for dictionary membership, the parser must extract:

```text
FOE
FOG
FOH
FON
FOO
FOR
...
```

It must NOT attempt to interpret the other numerical/statistical fields as words.

The final fields contain metadata such as definitions, parts of speech, hooks/letters, and other lexicon information. These fields are **not required for basic word membership validation**.

For this project, the important transformation is:

```text
CSW record
    ↓
extract first field
    ↓
"FOE"
    ↓
uppercase
    ↓
Set<string>
```

The existing `parseUK()` function is intended to perform this extraction and should be verified against the actual CSW2024 file before being changed.

### Important CSW edge cases

Do not assume every CSW record can be parsed by simply taking the first whitespace-delimited token.

The record is structured like a tuple:

```text
('WORD', ...)
```

Therefore the parser should extract the quoted first field according to the actual record structure.

For example:

```text
('FOE', ...)
```

must become:

```text
FOE
```

not:

```text
('FOE',
```

and not:

```text
FOE',
```

The parser must also tolerate:

* `None` fields
* numeric fields
* quoted strings
* definitions containing spaces
* definitions containing punctuation
* apostrophes inside textual fields
* optional metadata fields
* different metadata values between records

The parser must only use the **headword field** for membership validation.

---

## NWL2023 format

The NWL2023 sample in this project has a very different structure.

Examples:

```text
GOO a sticky or viscid substance [n GOOS]
GOR used as a mild oath [interj]
GOS < GO, a Japanese board game [n]
GOT < GET, to obtain or acquire [v]
GOX gaseous oxygen [n GOXES]
GOY a non-Jewish person [n GOYIM, GOYS]
GRR used to express anger or annoyance [interj]
GUL a design in oriental carpets [n GULS]
GUM to clog with a sticky, viscid substance [v GUMMED, GUMMING, GUMS] : GUMMER [n]
GUN to shoot with a portable firearm [v GUNNED, GUNNING, GUNS]
GUT to remove the guts (intestines) of [v GUTS, GUTTED, GUTTING]
GUV a {governor=n} [n GUVS]
GUY to {ridicule=v} [v GUYED, GUYING, GUYS]
GYM a room for athletic activities [n GYMS]
GYP to {swindle=v} [v GYPPED, GYPPING, GYPS] : GYPPER [n], GYPSTER [n]
HAD < HAVE, to hold as a possession, privilege, or entitlement [v]
HAE to {have=v} [v HAED, HAEING, HAEN, HAEN, HAES]
HAG to {hack=v} [v HAGGED, HAGGING, HAGS]
HAH {ha=n} [n HAHS]
HAJ {hadj=n} [n HAJES]
HAM to {overact=v} [v HAMMED, HAMMING, HAMS]
HAO a monetary unit of Vietnam [n HAO, HAOS]
HAP to {happen=v} [v HAPPED, HAPPING, HAPS]
HAS <ha=n> [n] / < HAVE, to hold as a possession, privilege, or entitlement [v]
HAT to provide with a covering for the top of the head [v HATS, HATTED, HATTING]
HAW to turn left [v HAWED, HAWING, HAWS]
HAY to dry cut grass for fodder [v HAYED, HAYING, HAYS] : HAYER [n]
```

For membership validation, the important information is the **first token on each line**:

```text
GOO ...
 ↑
 word
```

Therefore:

```text
GOO → GOO
GOR → GOR
GOS → GOS
GOT → GOT
...
```

The rest of the line contains definitions, grammatical information, inflections, redirects, and other lexicographic information.

For example:

```text
GOT < GET, to obtain or acquire [v GOT]
```

The valid dictionary entry being tested is:

```text
GOT
```

NOT:

```text
GET
```

Similarly:

```text
GOY a non-Jewish person [n GOYIM, GOYS]
```

means the headword being represented is:

```text
GOY
```

while `GOYIM` and `GOYS` are related inflected forms/metadata and must not accidentally replace the headword.

---

## Critical parser distinction

The two formats should conceptually be treated as:

```text
CSW2024
────────
record/tuple-like structure
        ↓
extract first quoted field
        ↓
HEADWORD
```

and:

```text
NWL2023
────────
one lexicographic entry per line
        ↓
extract first token
        ↓
HEADWORD
```

Therefore:

```ts
parseCSW(...)
```

and:

```ts
parseNWL(...)
```

may legitimately use different parsing strategies.

Do not force both dictionaries through one generic parser merely to reduce code duplication.

Correctness is more important than superficial parser reuse.

---

## Do not treat metadata as dictionary words

The following must NOT accidentally become independent dictionary entries:

### CSW

From:

```text
('FOE', ..., 'EFO', ..., 'enemy, opponent [n]')
```

Do not add:

```text
EFO
```

or:

```text
ENEMY
OPPONENT
```

as dictionary words merely because they appear in the record.

Only:

```text
FOE
```

is the headword.

### NWL

From:

```text
GUM to clog ... [v GUMMED, GUMMING, GUMS] : GUMMER [n]
```

the parser must not interpret:

```text
GUMMED
GUMMING
GUMS
GUMMER
```

as separate headwords unless they independently appear as their own NWL entries.

The parser is extracting the **entry's headword**, not every word appearing in its definition.

---

## Why this matters for `isWordValid()`

The existing dictionary architecture is:

```text
dictionary file
      ↓
parser
      ↓
Set<string>
      ↓
isWordValid(name, word)
      ↓
dictionary.has(normalizedWord)
```

Therefore the parser must produce a clean set such as:

```ts
Set([
  "FOE",
  "FOG",
  "FOH",
  "FON",
  "FOO",
  "FOR",
  ...
])
```

for CSW, and:

```ts
Set([
  "GOO",
  "GOR",
  "GOS",
  "GOT",
  "GOX",
  "GOY",
  ...
])
```

for NWL.

The validation layer should never need to understand the internal metadata of a dictionary entry.

---

## Important correction about dictionary naming

Do not describe CSW simply as "UK".

CSW is the international Collins Scrabble lexicon used in international/WESPA play and incorporates World English; it is not merely a UK-English dictionary.

NWL2023 is the North American lexicon governing competitive Scrabble in the United States and Canada.

Use these labels:

```text
CSW
Collins Scrabble Words
International / World English

NWL
NASPA Word List
North American / US & Canada
```

If the application exposes a human-readable dictionary selector, prefer:

```ts
type DictionaryName = "CSW" | "NWL";
```

with UI labels such as:

```text
CSW — Collins / International
NWL — NASPA / North American
```

Do not use `"UK"` as the public dictionary identifier for CSW.

---

## Final parsing requirement

Before changing the parser:

1. Open the actual `CSW2024.txt`.
2. Open the actual `NWL2023.txt`.
3. Inspect multiple entries from each file.
4. Confirm the actual delimiter/record structure.
5. Confirm the first field/token is the headword.
6. Confirm that metadata and definitions are not being inserted into the word set.
7. Preserve the existing successful behavior unless there is a demonstrated parsing bug.
8. Add parser tests using representative samples from BOTH formats.
9. Only after the dictionary sets are correctly constructed should `dictionary.ts` perform word membership validation.

The key principle is:

```text
CSW record → extract HEADWORD
NWL line   → extract HEADWORD
                 ↓
             Set<string>
                 ↓
          isWordValid(...)
```

The validator should care about **whether a headword exists**, not how the dictionary's metadata or definitions are structured.
