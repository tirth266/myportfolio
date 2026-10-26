/**
 * AI Routes — Practical 13: AI API Integration
 *
 * Exposes a single authenticated POST endpoint that accepts a task title
 * and returns an AI-generated description from the Gemini API.
 *
 * Pipeline: requireAuth → validateJson → validate(rules.generateDescription) → controller
 *
 * The GEMINI_API_KEY lives exclusively in backend/.env and is never sent
 * to the browser. Frontend code only ever calls /api/ai/generate-description
 * on its own backend — it never contacts the AI provider directly.
 */

const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const requireAuth = require("../middleware/auth");
const validateJson = require("../middleware/validateJson");
const { validate, rules } = require("../middleware/validate");

// All AI endpoints require a valid JWT (same guard as task routes)
router.use(requireAuth);

// POST /api/ai/generate-description
// Body: { "title": "Task title string" }
// Response: { "description": "...", "fallback": false }
router.post(
  "/generate-description",
  validateJson,
  validate(rules.generateDescription),
  aiController.generateDescription
);

module.exports = router;
