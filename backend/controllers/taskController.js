/**
 * Task Controller — Practical 5
 *
 * All CRUD operations now use the Mongoose Task model (MongoDB).
 * Practical 4 bonus features are preserved:
 *   ✅ Search by title (regex, case-insensitive)
 *   ✅ Filter by completed status
 *   ✅ Sort (newest / oldest)
 *   ✅ Pagination with metadata
 *
 * Error handling:
 *   - All Mongoose errors are forwarded to the global error handler via next(err).
 *   - The global error handler (errorHandler.js) converts Mongoose ValidationError
 *     and CastError into clean JSON responses.
 *   - Controllers never return raw Mongoose objects or stack traces.
 */

const Task              = require("../models/Task");
const { sendSuccess, sendError } = require("../utils/response");

// ── GET /tasks ─────────────────────────────────────────────────────────────────
/**
 * Returns all tasks from MongoDB with optional filtering, sorting, and pagination.
 *
 * Query params
 *   ?title=<string>        case-insensitive search on title
 *   ?completed=true|false  filter by completion status
 *   ?sort=newest|oldest    sort by createdAt (default: newest)
 *   ?page=<n>              pagination page  (default: 1)
 *   ?limit=<n>             items per page   (default: 10, max: 100)
 */
const getAllTasks = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by completion status
    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === "true";
    }

    // Search by title (MongoDB regex — case-insensitive)
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }

    // Sort by createdAt
    const sortOption =
      req.query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    // Pagination
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    // Run query and count in parallel for performance
    const [tasks, totalCount] = await Promise.all([
      Task.find(filter).sort(sortOption).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    sendSuccess(res, 200, "Tasks retrieved successfully", {
      tasks,
      pagination: {
        currentPage:     page,
        limit,
        totalCount,
        totalPages,
        hasNextPage:     page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /tasks/:id ─────────────────────────────────────────────────────────────
/**
 * Returns a single task by its MongoDB ObjectId.
 *
 * Responses
 *   200  task found
 *   404  valid ObjectId but no document exists
 *   400  invalid ObjectId format (caught by validateTaskId middleware before this)
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    sendSuccess(res, 200, "Task retrieved successfully", task);
  } catch (error) {
    next(error);
  }
};

// ── POST /tasks ────────────────────────────────────────────────────────────────
/**
 * Creates a new task in MongoDB.
 *
 * Body fields
 *   title       String   required
 *   description String   optional
 *   completed   Boolean  optional (default: false)
 *   priority    String   optional (default: 'medium')  enum: low|medium|high
 *
 * The pre-save hook in Task.js trims whitespace from title before saving.
 * If Mongoose validation fails, the error is forwarded to errorHandler which
 * returns a structured { success, message, errors } JSON — not a raw Mongoose object.
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    // Build a new document — Mongoose validation + pre-save hook run on .save()
    const task = new Task({ title, description, completed, priority });
    await task.save();

    sendSuccess(res, 201, "Task created successfully", task);
  } catch (error) {
    next(error); // Mongoose ValidationError → handled by errorHandler.js
  }
};

// ── PUT /tasks/:id ─────────────────────────────────────────────────────────────
/**
 * Partially updates an existing task.
 *
 * Uses findById() + modify fields + save() so that:
 *   ✅ pre-save hook fires (title trimming)
 *   ✅ Mongoose schema validation runs
 *   ✅ updatedAt is automatically refreshed by the timestamps option
 *
 * Only fields present in the request body are updated (partial update).
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const { title, description, completed, priority } = req.body;

    // Apply only the fields that were explicitly sent
    if (title       !== undefined) task.title       = title;
    if (description !== undefined) task.description = description;
    if (completed   !== undefined) task.completed   = completed;
    if (priority    !== undefined) task.priority    = priority;

    await task.save(); // triggers pre-save hook + validation + updatedAt refresh

    sendSuccess(res, 200, "Task updated successfully", task);
  } catch (error) {
    next(error);
  }
};

// ── DELETE /tasks/:id ──────────────────────────────────────────────────────────
/**
 * Deletes a task by its MongoDB ObjectId and returns the deleted document.
 *
 * Responses
 *   200  deleted successfully (returns the deleted task)
 *   404  valid ObjectId but no document exists
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    sendSuccess(res, 200, "Task deleted successfully", task);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
