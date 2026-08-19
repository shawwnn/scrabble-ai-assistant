Yes. And this is an important distinction.

**Dictionary validation is not merely `words[] → dictionary`.** The `words[]` must first correctly represent **every word created by the placement**, including:

1. **The main/primary word** formed by the placed tiles.
2. **Every perpendicular cross-word** created by each placed tile.
3. **Parallel/coincident adjacent words** that arise from the placement configuration.
4. Every one of those words must independently pass the selected dictionary.

Your existing `getWordsFromMove()` is already attempting this:

```text
board + pending
      ↓
for every pending tile
      ↓
horizontal word
vertical word
      ↓
collect unique words
```

But before we declare this part complete, we need to **prove that it catches the scenarios you described**.

### So the next task is NOT simply "connect dictionary"

It's:

```text
PLACEMENT
   ↓
getWordsFromMove()
   ↓
ALL words created
   ↓
US/UK dictionary
   ↓
ALL valid?
```

And our tests need cases like:

```text
Main:
PLAY

Pending creates:
PLAY
AB
YE

→ check PLAY
→ check AB
→ check YE
→ invalid if ANY fails
```

And your more complex case:

```text
PLAY
##BED
```

where `B E D` are the newly placed tiles, while the existing `P L A Y` is already on the board.

We need to verify **exactly which complete words the board geometry produces**, rather than assuming only `BED` matters.

### Therefore our next step

Before changing production code, let's create **integration tests around `validateMove()` + dictionary** for:

- normal main word
- cross words
- multiple cross words
- a placement where one cross word is invalid
- parallel/coincident adjacency cases
- US vs UK dictionary selection

That will tell us whether `rules.ts` is already identifying the complete set correctly or whether `getWordsFromMove()` needs adjustment.

**This is the right next checkpoint.**
