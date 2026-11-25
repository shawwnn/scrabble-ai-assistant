# Vision OCR Implementation Plan

This tracks implementation for the canonical plan in
`docs/vision-ocr-integration.md`.

## Phases

- [x] Phase 1 — Cell isolation: board grid, premium filtering, rack tile splitting.
- [~] Phase 2 — OpenCV isolation: supplied empty-board screenshot passes; occupied boards remain unverified.
- [~] Phase 3 — App integration: upload → extract → validate → analyze works for the supplied screenshot; broader verification remains.
- [ ] Phase 4 — Accuracy gate: occupied boards, blank images, and mobile remain unverified; no release yet.

## Rules

- Free to run.
- Image stays on the user's device during extraction.
- One JPG, PNG, or WEBP image at a time.
- No OpenAI API in version one.
- No manual correction in version one.
- An empty board is valid: return `board: []` and read the visible rack.
- Premium-square labels are not occupied tiles.
- A blank rack tile is represented by `?`; it scores zero and counts toward a seven-tile bingo. Visual blank detection remains unverified.

## Checkpoints

Record the commit, test result, and any blocker after each phase.

## Completed checkpoints

- Earlier contract work — commit `178a4a8`; typecheck and 3 contract tests pass.
- Earlier prototype — commits `0f84260` and `18c9620`; supplied image failed because premium labels were read as board letters and rack letters were missed.
- Revised Phase 1 — deterministic 15×15 board cells and 7 rack regions; typecheck and 5 focused tests pass.
- Phase 2 retest — single-letter OCR still returned false board letters and only 6 rack letters.
- Decision — try Option B: OpenCV.js plus Tesseract.js; Option A failed accuracy.
- OpenCV test — browser build passes, but the supplied image still ends at “Board cannot be analyzed”; OpenCV bundle is about 15.5 MB uncompressed.
- Retest — the supplied empty-board screenshot now returns `board: []` and rack `AYERSEN` exactly. Occupied boards, other images, and mobile remain unverified.
- Occupied-board test — the first supplied screenshot incorrectly returned an empty board and rack `HCCRARU` (expected `HOORARU`); the second failed to read a rack tile. Neither passes the accuracy gate. Incorrect extraction can reach the analyzer, so its suggestions must not be relied upon.
- The three supplied screenshots are saved under `tests/fixtures/vision/`. After tile-color filtering changes, the empty-board image still passes; occupied-1 fails on an unreadable board tile. Exact occupied-board annotations and automated image tests remain outstanding.
- Board and rack annotations are now recorded in `tests/fixtures/vision/expected.json`; three structural annotation tests pass. The blue T blank flag is an assumption requiring confirmation. Automated image-to-JSON comparisons and occupied-board extraction fixes remain outstanding.
- Occupied-1 OCR crop retest: extraction progressed beyond row 2, column 6 but stopped at row 4, column 11 (one-based). No full JSON or accuracy pass yet.
