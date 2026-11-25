# Archived: OpenAI vision board extraction

> This is an archived alternative, not the active implementation plan. The
> canonical plan is `docs/vision-ocr-integration.md`.

The image analyzer accepts JPG, PNG, and WEBP uploads at `POST /api/analyze-image`.
The Express server sends the image to OpenAI's Responses API using a server-only
`OPENAI_API_KEY`. The vision model returns strict JSON with occupied board tiles
(`row`, `col`, `letter`, optional `blank`) and the visible rack letters. The
extracted payload is returned on `AnalyzeResponse.extracted` alongside move
recommendations.

Configure `OPENAI_API_KEY` and optionally `OPENAI_VISION_MODEL` (default:
`gpt-4.1-mini`). Never expose the API key in client code or a Vite variable.

The extraction layer intentionally does not depend on OpenCV or PaddleOCR yet.
It validates model output with Zod and rejects images without a readable rack.
Local preprocessing or a dedicated OCR fallback can be added later without
changing the upload or board-analysis APIs.
