# Grandmaster Benchmark Report

Post-OCR analyzer benchmark against six authentic bingo fixtures in this directory. Gemini and OCR were not used. Inputs are the fixture board, rack, and dictionary named in each fixture's `source.verifiedAgainst` field.

## Production change under test

`compareMoves()` in `code/server/lib/analyze.ts` ranks moves by score descending, then row, column, direction (horizontal first), and word. Bingo status no longer affects ranking. The bingo flag is still returned as data.

## Phase 1: Input and dictionary verification

- Dictionaries loaded through the existing `loadDictionary()`: CSW2024 (about 965 ms cold) and NWL2023 (about 445 ms cold).
- Smoke checks passed in both lists: `FRONTAL` valid, `ZZZZ` invalid.
- All six fixtures passed validation: coordinates in bounds, letters A–Z, rack of seven tiles, no blanks, empty board for opening fixtures, five-tile opening board for second-turn fixtures, and the committed move consuming exactly the rack tiles. `buildGrid()` reported no issues for any fixture.

## Phase 2: Move analysis

Each fixture was run through production `analyzeBoard()`, which returns the top five. All six produced suggestions with no board issues. Top five, using zero-based `(row, col)` and H/V direction:

| Fixture | Dictionary | Legal moves | Top five (word, start, direction, score) |
|---|---|---|---|
| BINGO-001 | NWL2023 | 668 | FRONTAL (3,7) V 78; FRONTAL (7,3) H 78; FRONTAL (1,7) V 72; FRONTAL (2,7) V 72; FRONTAL (5,7) V 72 |
| BINGO-002 | NWL2023 | 388 | ABUSIVE (6,7) V 82; ABUSIVE (7,6) H 82; ABUSIVE (2,7) V 80; ABUSIVE (7,2) H 80; ABUSIVE (1,7) V 76 |
| BINGO-003 | CSW2024 | 774 | FEATEST (3,7) V 78; FEATEST (7,3) H 78; FEATEST (1,7) V 72; FEATEST (2,7) V 72; FEATEST (5,7) V 72 |
| BINGO-004 | CSW2024 | 264 | WORRIERS (2,6) V 67; SOW (8,4) H 32; OW (8,5) H 29; ROWS (4,8) V 28; SWIZ (4,5) V 24 |
| BINGO-005 | CSW2024 | 680 | DRAWLERS (5,5) V 68; DEWS (4,2) V 27; WELDS (3,2) V 26; REWS (4,2) V 26; DREW (6,8) V 26 |
| BINGO-006 | NWL2023 | 190 | LIVIDITY (2,9) V 75; LIVIDITY (6,9) V 75; LIVIDITY (4,9) V 69; VALIDITY (6,7) V 66; TIDY (8,7) H 29 |

No duplicate placements were generated. The production top five matched a separate score-only sort of the full legal-move list in all six fixtures.

## Phase 3: Grandmaster benchmark

Each committed move was compared with the analyzer on word, start coordinates, direction, tiles used, and calculated score.

| Fixture | Actual move | Recorded | Top-five rank | Exact placement | Tiles | Score |
|---|---|---|---|---|---|---|
| BINGO-001 | FRONTAL (7,3) H | 78 | 2 | Yes | 7 | 78 |
| BINGO-002 | ABUSIVE (7,6) H | 82 | 2 | Yes | 7 | 82 |
| BINGO-003 | FEATEST (7,3) H | 78 | 2 | Yes | 7 | 78 |
| BINGO-004 | WORRIERS (2,6) V | 67 | 1 | Yes | 7 | 67 |
| BINGO-005 | DRAWLERS (5,5) V | 68 | 1 | Yes | 7 | 68 |
| BINGO-006 | VALIDITY (6,7) V | 66 | 4 | Yes | 7 | 66 |

In BINGO-001 to 003, the rank-1 move has the same score. The lower-row tiebreak places the committed move second. In BINGO-006, two higher-scoring LIVIDITY placements rank above VALIDITY. The committed move was not forced into the list.

## Phase 4: Summary

| Check | Result |
|---|---|
| Fixtures tested | 6 |
| Input validations passed | 6 of 6 |
| Dictionary loads | 2 of 2 (CSW2024, NWL2023) |
| Legal move generation | 6 of 6 |
| Actual move in top five | 6 of 6 |
| Exact placement matches | 6 of 6 |
| Tile count matches | 6 of 6 |
| Score matches | 6 of 6 |
| Failures | None |

## Caveats

- Only the six committed moves were checked against recorded scores. Scores for other suggestions come from the same engine and were not independently verified.
- Each fixture was tested against one dictionary, the one in its `verifiedAgainst` field. The other list was not tested for these boards.
- The source games used CSW12, CSW15, or TWL15. The local lists are CSW2024 and NWL2023, as noted in `VERIFICATION-REPORT.md`.
- The benchmark harness ran as scratch scripts outside the repository and is not committed.

## Test results

- Full Vitest suite: 10 files, 57 tests, all passing.
- `tsc --noEmit`: no errors.

### Test changes made with the ordering change

- `code/server/lib/moves.test.ts`: the test "prefers a bingo over a higher-scoring non-bingo move" asserted the removed bingo-first rule. It now asserts that a 90-point non-bingo move ranks above a 60-point bingo.
- `code/server/lib/moves.test.ts`: "ranks the bingo first and caps suggestions at five" is now "sorts suggestions by score and caps them at five". It checks that scores are non-increasing instead of checking that bingos come first.
