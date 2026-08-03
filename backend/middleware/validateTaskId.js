/**
 * Task ID Validator Middleware
 * Validates that task ID is a valid positive integer
 * Returns 400 Bad Request for invalid IDs
 */

const validateTaskId = (req, res, next) => {
  const id = req.params.id;

  // Check if ID is a valid positive integer
  if (!id || isNaN(id) || parseInt(id) <= 0 || !Number.isInteger(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID. Must be a positive integer.",
    });
  }

  // Convert to integer and attach to params
  req.params.id = parseInt(id);

  next();
};

module.exports = validateTaskId;
