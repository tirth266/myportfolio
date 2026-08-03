/**
 * 404 Not Found Middleware
 * Handles all requests to undefined routes
 * Must be placed after all other route handlers
 */

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

module.exports = notFound;
