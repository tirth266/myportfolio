/**
 * Task Controller — Practical 9
 * Business logic for MongoDB Task CRUD operations using Mongoose.
 * Every operation (success and failure) is recorded in logs/activity.csv.
 *
 * Read paths (GET /tasks, GET /tasks/:id) are served from the shared in-memory
 * cache when warm; write paths (POST, PUT, DELETE) invalidate the affected
 * cache entries so a cached read can never outlive the data it describes.
 */

const Task = require("../models/Task");
const { logActivity } = require("../utils/activityLogger");
const taskCache = require("../cache/taskCache");

// ── GET /tasks ────────────────────────────────────────────────────────────────
/**
 * Retrieve all tasks.
 *
 * Flow: Auth Middleware (router level) -> Cache Check -> HIT returns cached
 * data -> MISS queries MongoDB, stores the result, then responds.
 *
 * .lean() returns plain JS objects instead of hydrated Mongoose documents. The
 * result is only ever serialized to JSON, never saved or passed to document
 * methods, so the hydration cost is pure waste here.
 */
const getAllTasks = async (req, res, next) => {
  const cached = taskCache.getAllTasks();

  if (cached.hit) {
    logActivity("GET", "/tasks", 200, "Cache HIT — served from memory");
    return res.status(200).json({
      success: true,
      tasks: cached.value,
      cached: true,
    });
  }

  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();

    taskCache.setAllTasks(tasks);

    logActivity("GET", "/tasks", 200, `Cache MISS — queried MongoDB (${tasks.length} tasks)`);
    res.status(200).json({
      success: true,
      tasks,
      cached: false,
    });
  } catch (error) {
    logActivity("GET", "/tasks", 500, "Failed to retrieve tasks");
    next(error);
  }
};

// ── GET /tasks/:id ────────────────────────────────────────────────────────────
/**
 * Retrieve a single task by MongoDB ObjectId.
 *
 * Cached separately under task_<id> so a request for one task never forces a
 * full collection read and never disturbs the GET /tasks entry.
 */
const getTaskById = async (req, res, next) => {
  const url = `/tasks/${req.params.id}`;
  const id = req.params.id;

  const cached = taskCache.getTask(id);

  if (cached.hit) {
    logActivity("GET", url, 200, `Cache HIT — ${cached.value.title}`);
    return res.status(200).json({
      success: true,
      task: cached.value,
      cached: true,
    });
  }

  try {
    const task = await Task.findById(id).lean();

    if (!task) {
      logActivity("GET", url, 404, "Cache MISS — Task not found");
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    taskCache.setTask(id, task);

    logActivity("GET", url, 200, `Cache MISS — queried MongoDB: ${task.title}`);
    res.status(200).json({
      success: true,
      task,
      cached: false,
    });
  } catch (error) {
    logActivity("GET", url, 500, "Failed to retrieve task");
    next(error);
  }
};

// ── POST /tasks ───────────────────────────────────────────────────────────────
/**
 * Create a new task in MongoDB
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      logActivity("POST", "/tasks", 400, "Failed to create task: title is required");
      return res.status(400).json({
        success: false,
        error: "Title is required and cannot be empty or only whitespace",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: Boolean(completed),
      priority: priority || "medium",
    });

    // The task list has changed — drop it so the next GET /tasks re-reads MongoDB.
    taskCache.invalidateAllTasks();

    logActivity("POST", "/tasks", 201, `Created task: ${task.title} (cache invalidated)`);
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    logActivity("POST", "/tasks", 500, "Failed to create task");
    next(error);
  }
};

// ── PUT /tasks/:id ────────────────────────────────────────────────────────────
/**
 * Update an existing task in MongoDB
 * Applies Mongoose schema validators (runValidators: true)
 */
const updateTask = async (req, res, next) => {
  const url = `/tasks/${req.params.id}`;
  try {
    const { title, description, completed, priority } = req.body;

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      logActivity("PUT", url, 400, "Failed to update task: title cannot be empty");
      return res.status(400).json({
        success: false,
        error: "Title cannot be empty or only whitespace",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (priority !== undefined) updateData.priority = priority;

    // { new: true } returns the post-update document, which we only serialize to
    // JSON, so .lean() avoids building full Mongoose documents for no benefit.
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTask) {
      logActivity("PUT", url, 404, "Task not found");
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Two entries are now stale: the list it appeared in, and its own entry.
    taskCache.invalidateAllTasks();
    taskCache.invalidateTask(req.params.id);

    logActivity("PUT", url, 200, `Updated task: ${updatedTask.title} (caches invalidated)`);
    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    logActivity("PUT", url, 500, "Failed to update task");
    next(error);
  }
};

// ── DELETE /tasks/:id ─────────────────────────────────────────────────────────
/**
 * Delete a task by MongoDB ObjectId
 */
const deleteTask = async (req, res, next) => {
  const url = `/tasks/${req.params.id}`;
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id).lean();

    if (!deletedTask) {
      logActivity("DELETE", url, 404, "Task not found");
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Same rule as PUT: the list changed AND this id no longer resolves.
    taskCache.invalidateAllTasks();
    taskCache.invalidateTask(req.params.id);

    logActivity("DELETE", url, 200, `Deleted task: ${deletedTask.title} (caches invalidated)`);
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    logActivity("DELETE", url, 500, "Failed to delete task");
    next(error);
  }
};

// ── GET /tasks/cache/stats ────────────────────────────────────────────────────
/**
 * Practical 9 debug endpoint — cache hit/miss counters.
 * Registered BEFORE "/:id" so Express matches the literal path first and never
 * treats "cache" as a task id.
 */
const getCacheStats = (req, res) => {
  const stats = taskCache.getStats();

  logActivity("GET", "/tasks/cache/stats", 200, "Returned cache statistics");

  res.status(200).json({
    success: true,
    cache: stats,
  });
};

// ── POST /tasks/cache/reset ───────────────────────────────────────────────────
/**
 * Practical 9 helper — clear the cache and zero the counters so a timed
 * measurement can start from a known state.
 */
const resetCacheStats = (req, res) => {
  taskCache.flushAll();
  taskCache.resetStats();

  logActivity("POST", "/tasks/cache/reset", 200, "Cache flushed and counters reset");

  res.status(200).json({
    success: true,
    message: "Cache flushed and statistics reset",
  });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStats,
  resetCacheStats,
};
