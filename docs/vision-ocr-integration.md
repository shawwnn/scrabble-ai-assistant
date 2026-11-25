# Vision-Based Board and Rack Detection

> **Canonical feature plan:** This is the single source of truth for the
> `feature/openai-vision-image-extraction` branch. Implementation details live
> in `docs/openai-vision-analyzer.md` and must follow this plan.

## Status

The active plan is a free browser pipeline using Canvas preprocessing and
Tesseract.js. The first prototype failed because it OCR'd premium labels and
misread rack tiles. The revised plan fixes cell selection before adding more
OCR complexity.

## Product decisions

- The first version must be completely free to run.
- The image must stay on the user's device during extraction.
- Support one JPG, PNG, or WEBP image at a time.
- Work on laptop, desktop, and mobile browsers.
- Be accurate enough to use without manual correction.
- Free Vercel or Render hosting is a future deployment target.
- OpenAI is a possible future upgrade, not part of the first version.

## Goal

Allow a user to upload a JPG or other supported image, then convert it into
JSON containing occupied board coordinates and letters plus the visible rack.
The extracted data feeds the existing analyzer.

## Problem statement

Reliable local OCR and computer-vision extraction is currently too costly and
complex for this starter. OpenCV would require image normalization, board
geometry detection, tile segmentation, and perspective handling. PaddleOCR
would still require board-cell mapping and game-specific validation. Building
those pieces first would delay the user-facing feature.

The immediate problem is therefore: a user has a board image, but the analyzer
needs structured board coordinates and rack letters.

## Proposed solution: free browser extraction

Accept a JPG, PNG, or WEBP image in the browser, use Canvas to isolate the
board and rack tiles, run Tesseract.js only on likely letter tiles, and produce
strict JSON matching the application contract:

```json
{
  "board": [{ "row": 7, "col": 7, "letter": "A" }],
  "rack": ["E", "R", "T", "A", "I", "N", "S"]
}
```

The application validates the extracted result before passing it to the
existing analyzer. The image can remain in the browser during extraction, so
the free deployment does not require an OpenAI API key, GPU server, or paid
provider usage.

## Free lightweight deployment flow

The free version does not run a large AI model on Render or Vercel. The hosted
React application downloads a small browser OCR/runtime dependency, and the
user's device performs extraction locally:

```text
Image file
  → browser image preparation
  → board/grid and letter extraction
  → { board, rack } JSON
  → validation
  → existing board analyzer
```

The image can remain in the browser during extraction. After confirmation, only
the structured board/rack JSON needs to reach the analyzer. This avoids OpenAI
API usage and does not require a GPU or model server. The browser still
downloads OCR code/language data and uses the device's CPU and memory.

## Stable handoff between extraction methods

Local OCR and OpenAI vision are different implementations of the same contract:

```ts
type BoardExtraction = {
  board: BoardTileInput[];
  rack: string[];
};
```

```text
local browser extractor ─┐
                         ├─ { board, rack } → validation → analyzer
OpenAI server extractor ─┘
```

The move calculation, scoring, coordinates, and results UI should consume only
`BoardExtraction`. Switching providers later changes only the extraction
adapter. A future OpenCV/PaddleOCR adapter can use the same handoff.

## Cost and security decision

The active free path has no provider API bill. It still needs normal browser
and application safeguards:

- maximum image size and supported MIME types;
- browser processing timeout;
- no unnecessary upload or storage of raw images;
- clear failure when extraction is uncertain; the first version does not allow
  manual correction.

The extractor should return structured data containing:

- occupied board coordinates and letters;
- rack letters;
- a clear indication when the image cannot be reliably read.

Structured output should be validated against the application's board and rack rules before it is accepted.

## Benefits

- Has no OpenAI API or model-hosting cost.
- Works with a free static/server deployment such as Vercel or Render.
- Keeps a stable, provider-independent extraction contract.
- Reuses the existing board analyzer once `{ board, rack }` has been extracted.
- Leaves room to add OpenCV, PaddleOCR, or another provider later without
  redesigning the upload flow.

## Tradeoffs and risks

- Vision-model output can be wrong even when it is valid JSON, especially with
  glare, perspective, shadows, decorative fonts, blank tiles, or occlusion.
- Browser CPU and memory use vary by device.
- OCR assets still need to be downloaded by the browser.
- Coordinates are an interpretation of the image and require validation and,
  eventually, user correction before being treated as authoritative.
- The first version is an extraction abstraction, not a complete OCR system or
  a guaranteed game-state detector.

## Proposed flow

1. The client uploads one JPG, PNG, or WEBP image.
2. The browser prepares the image and runs the local extractor.
3. The client validates the extracted result.
4. The client validates the result without manual editing.
5. The client sends `{ board, rack }` JSON to the existing analyzer.
6. Unreadable or incomplete results are rejected before analysis.

## Release plan

The work should be delivered in gated phases:

1. **Cell isolation** — use Canvas to locate the square board, divide it into
   15×15 cells, separate premium/empty cells from letter tiles, and split the
   seven rack tiles.
2. **OCR extraction** — run Tesseract.js only on isolated letter tiles and
   return validated zero-based JSON.
3. **Upload and response integration** — connect extraction to the existing
   processing flow and retain move analysis.
4. **Fixture and quality validation** — add representative image fixtures,
   test coordinate and rack extraction, reject malformed or incomplete output,
   and measure latency and failure modes.
5. **Accuracy gate** — accept results only when the extractor meets the agreed
   accuracy target on representative images. Do not add manual correction to
   compensate for poor extraction.
6. **Optional preprocessing** — add OpenCV.js only if phone-photo tests need
   perspective correction; do not add it by default.

Each phase should leave the application buildable and should not broaden the
scope into continuous camera scanning or automatic gameplay.

## Success criteria

The feature is successful when a supported board image can produce validated
JSON containing occupied tile coordinates and rack letters, the result can be
passed to the existing analyzer, invalid images fail clearly, and the agreed
accuracy target is met without manual correction.

## Free-version controls

- Require an explicit scan action.
- Limit image dimensions and upload size.
- Stop browser processing after a timeout.
- Avoid uploading or storing raw images unless explicitly required.
- Show a clear failure message when extraction is incomplete.

## Accuracy risks

The extractor may misread tiles or coordinates because of glare, shadows,
perspective, decorative tile fonts, blank tiles, occlusion, or a partially
visible rack. Valid JSON is not proof that the detected board is correct.

The application should validate at least:

- a 15×15 board coordinate system;
- one letter per occupied tile;
- rack size and duplicate-letter counts;
- coordinate uniqueness;
- consistency between reported words and occupied tiles where applicable.

The UI should clearly report when the image cannot be read reliably. Since the
first version does not allow correction, the accuracy gate is mandatory.

## Limits and not in the first version

- Continuous frame-by-frame camera analysis.
- Manual correction of the extracted board or rack.
- Multiple images or continuous camera scanning.
- Dependence on model confidence alone.
- OpenCV or PaddleOCR integration. These are deferred behind the extraction
  abstraction because they are not yet practical to implement in the starter.
- Automatic board correction or user confirmation UI.

## Future fallback

If latency, cost, or accuracy is inadequate, add lightweight local
preprocessing or improve the browser OCR behind the same extraction contract.
An optional hosted provider can remain a fallback for ambiguous regions rather
than processing every image.

## Archived alternatives

### OpenAI vision API

The server-side OpenAI Responses API was considered because it can accept the
same image and return strict JSON quickly. It is not the active plan because it
requires separate API billing or available API credits. A Codex or ChatGPT
subscription does not automatically pay for application API calls.

It remains an optional future provider behind the same `{ board, rack }`
contract. The previous implementation reference is preserved in
`docs/openai-vision-analyzer.md`.

### Server-hosted OCR

Running OpenCV, PaddleOCR, or a larger local model on Render/Vercel was also
considered. It avoids provider API billing but adds deployment size, runtime,
CPU, memory, and implementation complexity. It is deferred unless the browser
extraction spike fails the quality criteria.

## Evaluation plan

Before production use, collect representative photos covering different lighting, angles, tile sets, blank tiles, and rack positions. Measure:

- exact board-state accuracy;
- rack-letter accuracy;
- coordinate error rate;
- average latency;
- browser processing time and device compatibility;
- correction rate after user review.

The existing files under `server/fixtures/` can provide seed cases for downstream board-state tests, but image fixtures and expected detections should be added separately when the integration is implemented.
