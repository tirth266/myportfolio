/**
 * AI Controller — Practical 13: AI API Integration
 * --------------------------------------------------
 * Handles POST /api/ai/generate-description.
 *
 * Security principles applied:
 *  - GEMINI_API_KEY is read exclusively from process.env (never logged or returned).
 *  - Only the task title is forwarded to the provider; no credentials, user
 *    profiles, or other task data are included in the prompt.
 *  - A per-normalized-title rate limit (1 request per title per 60 s) prevents
 *    runaway costs if a client rapidly retries generation.
 *  - Provider errors are caught and returned as structured JSON; raw error
 *    objects, stack traces, and provider response bodies are never forwarded.
 *  - A 10-second provider timeout prevents the server from hanging.
 *  - The generated text is returned to the caller — it is NOT persisted to the
 *    database; persistence only happens when the user submits the task form.
 *
 * Responsible AI:
 *  - Only the task title is sent to Gemini; no PII or credentials.
 *  - The response carries a disclaimer field so the frontend can surface it.
 *  - Content is returned as editable text; the user explicitly reviews it.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── In-memory rate limiter ──────────────────────────────────────────────────
// Key: normalized title (lower-cased, trimmed)
// Value: timestamp of last successful generation request
// One generation per normalized title per 60 seconds prevents runaway cost.
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60_000; // 60 seconds

/**
 * Clean up stale entries periodically so the map does not grow unboundedly
 * in long-running server processes.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of rateLimitMap.entries()) {
    if (now - ts > RATE_LIMIT_MS) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_MS * 2).unref(); // .unref() so this timer never blocks process exit

// ── Gemini client (lazy — only constructed when the key is present) ──────────
let _genAI = null;
const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

// ── Controller ───────────────────────────────────────────────────────────────

/**
 * POST /api/ai/generate-description
 *
 * Request body (already validated by validate middleware):
 *   { "title": "Prepare project presentation" }
 *
 * Success response (200):
 *   { "success": true, "description": "...", "fallback": false,
 *     "disclaimer": "AI-generated suggestion …" }
 *
 * Graceful-degradation responses (503 / 429):
 *   { "success": false, "message": "<safe message>", "fallback": true }
 */
const generateDescription = async (req, res) => {
  const title = (req.body.title || "").trim();

  // Normalize for rate-limiting: same title regardless of case/spacing
  const titleKey = title.toLowerCase().replace(/\s+/g, " ");

  // ── Rate limit check ──────────────────────────────────────────────────────
  const lastCall = rateLimitMap.get(titleKey);
  if (lastCall && Date.now() - lastCall < RATE_LIMIT_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastCall)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Rate limit: please wait ${retryAfter}s before generating a description for the same title again.`,
      fallback: true,
    });
  }

  // ── API key check ─────────────────────────────────────────────────────────
  const genAI = getGenAI();
  if (!genAI) {
    // Key not configured — return graceful degradation, not a crash
    return res.status(503).json({
      success: false,
      message:
        "AI description generation is not configured on this server. " +
        "You can still enter a description manually.",
      fallback: true,
    });
  }

  // ── Build prompt (minimal data — only the title) ──────────────────────────
  const prompt =
    `Write a concise, actionable task description (2–3 sentences, plain text, ` +
    `no bullet points, no markdown) for a task titled: "${title}". ` +
    `Focus on what needs to be done and the expected outcome.`;

  // ── Call Gemini with a timeout ────────────────────────────────────────────
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // AbortController gives us a provider-level timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000); // 10 s

    let result;
    try {
      result = await model.generateContent(prompt, {
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const text = result.response.text().trim();

    if (!text) {
      return res.status(503).json({
        success: false,
        message: "AI returned an empty response. Please try again or enter a description manually.",
        fallback: true,
      });
    }

    // Record the successful call time for rate limiting
    rateLimitMap.set(titleKey, Date.now());

    return res.status(200).json({
      success: true,
      description: text,
      fallback: false,
      disclaimer:
        "AI-generated suggestion: Review and edit this description before saving. " +
        "Do not enter confidential or sensitive information. " +
        "Your task title was sent to the Google Gemini API to generate this suggestion.",
    });
  } catch (err) {
    // Log minimal context (no key, no prompt body, no user data)
    console.error("[AI] Gemini generation failed:", err?.message || "Unknown error");

    // Distinguish timeout from other failures
    if (err?.name === "AbortError") {
      return res.status(503).json({
        success: false,
        message: "AI provider did not respond in time. Please try again or enter a description manually.",
        fallback: true,
      });
    }

    // Quota / invalid-key errors from Gemini SDK
    if (err?.message?.includes("API_KEY_INVALID") || err?.message?.includes("API key")) {
      return res.status(503).json({
        success: false,
        message: "AI service is temporarily unavailable. Please enter a description manually.",
        fallback: true,
      });
    }

    return res.status(503).json({
      success: false,
      message: "AI service encountered an error. Please enter a description manually.",
      fallback: true,
    });
  }
};

module.exports = { generateDescription };
