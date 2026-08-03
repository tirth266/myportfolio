/**
 * Task Routes
 * Defines all API endpoints for task management
 */

const express = require("express");
const router = express.Router();
const validateTaskId = require("../middleware/validateTaskId");
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

/**
 * GET /tasks
 * Retrieve all tasks (with optional filters, sorting, and pagination)
 */
router.get("/", getAllTasks);

/**
 * POST /tasks
 * Create a new task
 */
router.post("/", createTask);

/**
 * GET /tasks/:id
 * Retrieve a single task by ID
 */
router.get("/:id", validateTaskId, getTaskById);

/**
 * PUT /tasks/:id
 * Update a task by ID
 */
router.put("/:id", validateTaskId, updateTask);

/**
 * DELETE /tasks/:id
 * Delete a task by ID
 */
router.delete("/:id", validateTaskId, deleteTask);

module.exports = router;
