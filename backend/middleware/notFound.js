/**
 * 404 Not Found Middleware (Practical 4)
 * Handles undefined routes and returns structured JSON
 */

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
};

module.exports = notFound;
