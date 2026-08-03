/**
 * Global Error Handler Middleware
 * Catches all errors and returns a consistent error response
 * Never exposes stack traces in production
 */

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  // Log error details for debugging (in production, use proper logging service)
  console.error(`Error [${statusCode}]: ${message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
