# Vision-Based Board and Rack Detection

## Status

Proposed integration. This document records the initial design decision; it does not add an API route or implement image detection.

## Goal

Allow a user to capture a photo of a Scrabble board and rack, then convert the image into the board state and rack data already used by the analyzer.

## Initial decision

Use a vision-capable LLM through a server-side integration for an explicit **Scan board** action. Do not process every camera frame. The first version should prioritize a simple user flow and useful error handling over continuous real-time detection.

The model should return structured data containing:

- occupied board coordinates and letters;
- rack letters;
- detected board orientation or image-quality problems;
- confidence or uncertainty for individual tiles;
- a clear indication when the image cannot be reliably read.

Structured output should be validated against the application's board and rack rules before it is accepted.

## Proposed flow

1. The client captures one still image.
2. The client resizes and compresses the image before upload.
3. The Express server sends the image to the selected vision model.
4. The server validates the model response against a strict schema.
5. The client displays the detected board and rack for user confirmation.
6. Low-confidence or invalid results are rejected with a request to retake the image.

The API key must remain on the server and must never be shipped to the browser.

## Cost controls

- Require an explicit scan action or a strong debounce interval.
- Limit image dimensions and upload size.
- Apply per-user and per-session scan limits.
- Set a project-level monthly hard spend limit and usage alerts.
- Stop requests when the local application budget is reached.
- Log request counts, response latency, and estimated usage without logging sensitive image data unnecessarily.
- Use a lower-cost vision model for normal scans and reserve a stronger model for retries or ambiguous images.

API billing is separate from a ChatGPT subscription. Provider-side spend limits are useful, but application-side limits are still required because provider enforcement and usage accounting may not be instantaneous.

## Accuracy risks

The model may misread tiles or coordinates because of glare, shadows, perspective, decorative tile fonts, blank tiles, occlusion, or a partially visible rack. A valid-looking JSON response is not proof that the detected board is correct.

The application should validate at least:

- a 15×15 board coordinate system;
- one letter per occupied tile;
- rack size and duplicate-letter counts;
- coordinate uniqueness;
- consistency between reported words and occupied tiles where applicable.

The UI should let the user correct the detected state before it reaches the analyzer.

## Not in the first version

- Continuous frame-by-frame camera analysis.
- Automatic submission of an unconfirmed board to the move analyzer.
- Dependence on model confidence alone.
- A new OCR/OpenCV pipeline before the vision approach has been evaluated with representative photos.

## Future fallback

If latency, cost, or accuracy is inadequate, add lightweight local preprocessing or OCR for stable tile and board recognition. The vision model can remain as a fallback for ambiguous regions rather than processing every image.

## Evaluation plan

Before production use, collect representative photos covering different lighting, angles, tile sets, blank tiles, and rack positions. Measure:

- exact board-state accuracy;
- rack-letter accuracy;
- coordinate error rate;
- average latency;
- average cost per successful scan;
- correction rate after user review.

The existing files under `server/fixtures/` can provide seed cases for downstream board-state tests, but image fixtures and expected detections should be added separately when the integration is implemented.
