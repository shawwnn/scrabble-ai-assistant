# Vision OCR Implementation Plan

This tracks implementation for the canonical plan in
`docs/vision-ocr-integration.md`.

## Phases

- [x] Phase 1 — Cell isolation: board grid, premium filtering, rack tile splitting.
- [ ] Phase 2 — OCR extraction: read isolated letters into validated JSON.
- [ ] Phase 3 — App integration: upload → extract → validate → analyze.
- [!] Phase 4 — Accuracy gate: failed on the supplied image; no release yet.

## Rules

- Free to run.
- Image stays on the user's device during extraction.
- One JPG, PNG, or WEBP image at a time.
- No OpenAI API in version one.
- No manual correction in version one.

## Checkpoints

Record the commit, test result, and any blocker after each phase.

## Completed checkpoints

- Earlier contract work — commit `178a4a8`; typecheck and 3 contract tests pass.
- Earlier prototype — commits `0f84260` and `18c9620`; supplied image failed because premium labels were read as board letters and rack letters were missed.
- Revised Phase 1 — deterministic 15×15 board cells and 7 rack regions; typecheck and 5 focused tests pass.
