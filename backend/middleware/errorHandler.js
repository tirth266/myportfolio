/**
 * Centralized Global Error Handler Middleware (Practical 5)
 * Placed at the end of the Express pipeline.
 * Converts Mongoose errors, JSON parse errors, and server exceptions
 * into structured JSON responses without leaking credentials or stack traces.
 */

const errorHandler = (err, req, res, next) => {
  // 1. Handle malformed JSON parsing errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON payload",
    });
  }

  // 2. Handle Mongoose Schema Validation Errors
  if (err.name === "ValidationError") {
    const errorMessages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: errorMessages[0] || "Validation failed",
      errors: errorMessages,
    });
  }

  // 3. Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid task ID format",
    });
  }

  // Safe server logging (without credentials)
  console.error(`[Error] ${err.name || "Exception"}: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const error = statusCode === 500 ? "Something went wrong" : err.message;

  res.status(statusCode).json({
    success: false,
    error,
  });
};

module.exports = errorHandler;
