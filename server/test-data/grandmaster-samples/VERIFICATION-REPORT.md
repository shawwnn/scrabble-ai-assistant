# Grandmaster Bingo Samples: Verification Report

Six fixtures from authentic Cross-Tables annotated tournament games: three opening bingos and three second-turn bingos. Every fixture comes from the game's GCG record, replayed and checked.

## Fixtures

| testId | Category | Game | Next player | Rack | Word | Start (row, col) | Direction | Score | Source |
|---|---|---|---|---|---|---|---|---|---|
| BINGO-001 | opening-bingo | Joey Mallick vs. Lloyd Mills, Alpharetta GA, R5 (TWL15) | Joey Mallick | AFLNORT | FRONTAL | 7, 3 | horizontal | 78 | annotated.php?u=22000 |
| BINGO-002 | opening-bingo | Michael Thelen vs. Josh Sokol, Lake George NY, R3 (TWL15) | Michael Thelen | ABEISUV | ABUSIVE | 7, 6 | horizontal | 82 | annotated.php?u=22250 |
| BINGO-003 | opening-bingo | Kurt Davies vs. Tim Weiss, New York NY, R18 (CSW15) | Kurt Davies | AEEFSTT | FEATEST | 7, 3 | horizontal | 78 | annotated.php?u=22086 |
| BINGO-004 | second-turn-bingo | Tim Weiss vs. Mina Le, New York NY, R4 (CSW15) | Mina Le | IORRRSW | WORRIERS | 2, 6 | vertical | 67 | annotated.php?u=22042 |
| BINGO-005 | second-turn-bingo | Tim Weiss vs. Jason Keller, Albany NY, R13 (CSW12) | Jason Keller | DELRRSW | DRAWLERS | 5, 5 | vertical | 68 | annotated.php?u=22091 |
| BINGO-006 | second-turn-bingo | Paul Holser vs. Jim Burlant, Dallas TX, R4 (TWL15) | Jim Burlant | DIILTVY | VALIDITY | 6, 7 | vertical | 66 | annotated.php?u=22127 |

Second-turn boards before Move 2 contain the single opening word: MIZEN (BINGO-004), QUARE (BINGO-005), AXION (BINGO-006). Each Move 2 places seven tiles and incorporates one board letter.

Full source URLs and GCG URLs are in each fixture's `source` block.

## Method

1. Downloaded each GCG from `cross-tables.com/annotated/selfgcg/...`.
2. Confirmed players, tournament, round, and dictionary on the annotated page. Each game is a tournament game; club games are excluded.
3. Replayed the moves with a standalone script (not committed to the repo). Coordinates follow GCG notation: `8D` is row 8, column D (horizontal); `H7` is column H, row 7 (vertical). Stored as zero-based `row` and `col`.
4. Scored each play from `code/shared/tiles.ts` and `code/shared/premiums.ts`. The center square is treated as a double-word square.
5. Checked every word against `code/backend/data-dict/CSW2024.txt` (CSW games) or `NWL2023.txt` (TWL games).

Results: for all six fixtures, the recomputed score matches the GCG score, all words are in the lexicon, and each rack contains seven real tiles with no blanks.

## Rejected candidates

- Club game (not tournament): 22016.
- Word absent from CSW2024: 22073 (COOLABLE) and 22081 (CORMED).
- Racks containing a blank: skipped.
- The five previous `GM-00X` candidates were not bingos. For example, Move 2 of GM-001 was AMU, which used three tiles. Those files were removed.

## Caveats

- Source games use CSW12, CSW15, and TWL15. Words were checked against CSW2024 and NWL2023, the lists available in the repo. Those are later editions, so validity was checked against them rather than the exact historical lists.
- Tournament names are the venue and date shown on the annotated pages.
