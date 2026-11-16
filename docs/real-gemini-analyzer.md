# Real Gemini Scrabble Analyzer

## Purpose

The analyzer uses a real uploaded Scrabble screenshot instead of simulated processing or demo board data.

The authoritative implementation is the root project:

- Frontend: `client/`
- Express backend: `server/`
- Shared types: `shared/`
- Production/serverless entrypoints: `server/node-build.ts` and `netlify/functions/api.ts`

There is no active duplicate `code/` or nested `scrabble-ai-assistant/` implementation in the workspace.

## End-to-end flow

1. `client/pages/AnalyzerUpload.tsx` validates the selected JPG, PNG, or WEBP image.
2. `client/pages/AnalyzerProcessing.tsx` starts backend-driven processing through `useAnalyzerProcessing`.
3. `client/lib/image-analyze-api.ts` converts the image to base64 and sends it to `POST /api/analyze-image`.
4. `server/routes/analyze.ts` validates the request and sends the image to Gemini using the server-only `GEMINI_API_KEY`.
5. Gemini returns structured JSON containing:
   - `board`: occupied tiles with zero-based `row`, `col`, `letter`, and optional `blank`
   - `rack`: visible rack letters
6. The backend validates the OCR response with Zod.
7. The existing `server/lib/analyze.ts` move engine validates the board and finds legal moves.
8. The result is stored in the analyzer upload store and displayed by `AnalyzerResults.tsx`.

## API contract

### `POST /api/analyze-image`

Request:

```json
{
  "image": {
    "mimeType": "image/png",
    "data": "base64-encoded-image"
  },
  "dictionary": "CSW2024"
}
```

Success returns the existing `AnalyzeResponse` shape with `dictionary`, `recommendation`, and `suggestions`.

Errors are returned as JSON with `error` and, when applicable, `issues`. Gemini configuration or upstream failures use server error statuses; invalid uploads use `400`; invalid recognized board data uses `422`.

The existing `POST /api/analyze` structured board/rack endpoint remains available for non-image callers and tests.

## Environment configuration

Set the Gemini key only in the backend environment:

```env
GEMINI_API_KEY=your-key
```

An optional `GEMINI_TEST_MODEL` overrides the default `gemini-2.5-flash` model. Never place either value in client code or expose the key through a Vite variable.

The Express JSON body limit is 15 MB. The frontend currently rejects images larger than 10 MB.

## Processing UI behavior

`useSimulatedProcessing` and timer/random-failure behavior were removed. The existing stepper remains in place, but progress is indeterminate while the real request is running. Errors from upload validation, Gemini, OCR validation, or move analysis are shown through the existing analyzer error page.

## Verification note

The OCR contract validation fixtures cover three empty-board cases and verify that no board tiles are detected, all seven rack letters are preserved in order, and the recognized rack is passed to the real CSW2024 move analyzer:

- `EASAFAZ` → `FAZES` — passed.
- `YGSVEZO` → expected `GYVES` — OCR validation passed, but the current CSW2024 analyzer ranks `ZYGOSE` higher.
- `AITUJUD` → `JUD` — passed.

The `GYVES` mismatch may be related to dictionary-version differences, but that explanation is not proven. Since two cases produce the expected move and all three OCR payloads validate an empty board and exact rack extraction, this is considered a positive validation signal rather than a confirmed three-case pass. The test intentionally does not hardcode or force the expected word in production.

These are deterministic OCR contract fixtures, not live Gemini screenshot runs. A live OCR result still requires a working `GEMINI_API_KEY` and an actual screenshot passed through `POST /api/analyze-image`.
