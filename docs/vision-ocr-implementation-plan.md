# Vision OCR Implementation Plan

This tracks implementation for the canonical plan in
`docs/vision-ocr-integration.md`.

## Phases

- [x] Phase 1 — Contract: define and validate `{ board, rack }` JSON.
- [~] Phase 2 — Browser extraction: prototype added; integration and accuracy check remain.
- [ ] Phase 3 — App integration: upload → extract → validate → analyze.
- [ ] Phase 4 — Accuracy gate: test real images and release only if no manual correction is needed.

## Rules

- Free to run.
- Image stays on the user's device during extraction.
- One JPG, PNG, or WEBP image at a time.
- No OpenAI API in version one.
- No manual correction in version one.

## Checkpoints

Record the commit, test result, and any blocker after each phase.

## Completed checkpoints

- Phase 1 — commit `178a4a8`; typecheck and 3 contract tests pass.
- Phase 2 prototype — browser-only Tesseract adapter added; typecheck and production build pass.
