import type { RequestHandler } from "express";

const DEFAULT_MODEL = "gemini-2.5-flash";

export const handleGeminiHealth: RequestHandler = async (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ ok: false, error: "Gemini is not configured." });
    return;
  }

  const model = process.env.GEMINI_TEST_MODEL ?? DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Reply with the single word OK." }] }],
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      res.status(502).json({ ok: false, error: "Gemini connectivity check failed." });
      return;
    }

    res.json({ ok: true });
  } catch {
    res.status(502).json({ ok: false, error: "Gemini connectivity check failed." });
  } finally {
    clearTimeout(timeout);
  }
};
