/**
 * JSON Content-Type Validator Middleware (Practical 4)
 * Ensures POST and PUT requests include Content-Type: application/json
 * Returns 400 Bad Request if validation fails
 */

const validateJson = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({
        success: false,
        error: "Content-Type must be application/json",
      });
    }
  }

  next();
};

module.exports = validateJson;
