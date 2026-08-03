/**
 * JSON Content-Type Validator Middleware
 * Ensures POST and PUT requests have Content-Type: application/json
 * Returns 415 Unsupported Media Type if validation fails
 */

const validateJson = (req, res, next) => {
  // Only validate for POST and PUT requests
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.get("content-type");

    // Check if Content-Type header exists and is application/json
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(415).json({
        success: false,
        message: "Content-Type must be application/json",
      });
    }
  }

  next();
};

module.exports = validateJson;
