# Backend Connectivity Validation

## Chosen architecture

Option 1 is the active approach: keep the existing Express server as the
backend for local development and deployment. The React/Vite frontend talks to
the same `/api/*` routes.

## Current validation routes

- `GET /api/ping` — dependency-free backend health check.
- `GET /api/gemini-health` — server-side Gemini text connectivity check.

The Gemini route reads `GEMINI_API_KEY` from `process.env`, sends a minimal text
request, and returns only `{ ok: true }` or a safe error. It does not expose the
key, return Gemini content, upload images, or perform OCR.

## Local workflow

```bash
pnpm install --frozen-lockfile
pnpm dev
curl http://localhost:8080/api/ping
curl http://localhost:8080/api/gemini-health
```

The upload screen currently performs client-side file validation and keeps the
selected file in memory. A future upload-registration step will POST the file
to Express as `FormData`, receive a receipt, and only then begin OCR work.

## Deployment requirement

The same Express API must be deployed with the frontend, and `GEMINI_API_KEY`
must be configured as a server-side environment variable in the selected
deployment environment. No Gemini credential belongs in client code.
