/**
 * Global Error Handler Middleware — Updated for Practical 5
 *
 * Catches all errors forwarded via next(err) and converts them to structured
 * JSON responses. Handles both Practical 4 generic errors and Practical 5
 * Mongoose-specific errors.
 *
 * Error types handled
 * ───────────────────
 *  ValidationError   — Mongoose schema validation failed (missing title, bad priority…)
 *  CastError         — Invalid MongoDB ObjectId passed to a query (safety net;
 *                      usually caught by validateTaskId middleware first)
 *  Generic errors    — Unexpected server errors (statusCode + message fallback)
 *
 * Security
 * ────────
 *  Stack traces are never sent to the client.
 *  MongoDB URIs, credentials, and internal DB details are never exposed.
 */

const errorHandler = (err, req, res, next) => {
  // Log the error type and message for debugging (safe — no credentials)
  console.error(`[${new Date().toISOString()}] Error [${err.name}]: ${err.message}`);

  // ── Mongoose Validation Error ──────────────────────────────────────────────
  // Thrown when schema validation fails: required field missing, enum mismatch, etc.
  if (err.name === "ValidationError") {
    const errors = {};
    Object.keys(err.errors).forEach((field) => {
      errors[field] = err.errors[field].message;
    });
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // ── Mongoose CastError (invalid ObjectId) ──────────────────────────────────
  // Thrown when an invalid value is cast to ObjectId inside a Mongoose query.
  // validateTaskId middleware normally catches this first, but this is a safety net.
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID format.",
    });
  }

  // ── Generic / Unexpected errors ────────────────────────────────────────────
  const statusCode = err.statusCode || 500;
  const message    = err.message    || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
