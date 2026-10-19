/**
 * Route-Specific Task ID Validator Middleware (Practical 5)
 * Validates that :id parameter is a valid MongoDB ObjectId
 * Returns 400 Bad Request if validation fails
 */

const mongoose = require("mongoose");

const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid task ID",
    });
  }

  next();
};

module.exports = validateTaskId;
