/**
 * Task ID Validator Middleware — Updated for Practical 5
 *
 * Practical 4 validated numeric IDs (1, 2, 3 …).
 * Practical 5 uses MongoDB ObjectIds (24-character hex strings, e.g. "68786cabc…").
 *
 * This middleware now validates that req.params.id is a valid MongoDB ObjectId
 * format before the request reaches the controller.
 *
 * Why this changed
 * ────────────────
 * MongoDB automatically assigns a unique ObjectId (_id) to every document.
 * A valid ObjectId is a 24-character hexadecimal string.
 * Passing an invalid format to Mongoose's findById() would throw a CastError.
 * By validating here, we return a clean 400 response before hitting the database.
 *
 * Returns 400 Bad Request for invalid ObjectId format.
 */

const mongoose = require("mongoose");

const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID. Must be a valid MongoDB ObjectId.",
    });
  }

  next();
};

module.exports = validateTaskId;
