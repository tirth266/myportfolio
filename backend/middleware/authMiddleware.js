/**
 * Backwards-compatible alias — Practical 7
 *
 * This middleware used to live here. It now lives in ./auth.js, which is the
 * single implementation used by every route.
 *
 * I am keeping this file so that any older import of
 * "../middleware/authMiddleware" (backend/tests, older tutorials) keeps
 * working instead of throwing "Cannot find module".
 *
 * New code should import from "../middleware/auth".
 */

module.exports = require("./auth");
