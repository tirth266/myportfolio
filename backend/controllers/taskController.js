/**
 * Task Controller
 * Handles all business logic for task operations
 * Includes CRUD operations and bonus features (search, sort, pagination)
 */

const { tasks, getNextId } = require("../data/tasks");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /tasks
 * Retrieves all tasks with optional filtering, sorting, and pagination
 * Query parameters:
 * - completed: boolean (filter by completion status)
 * - title: string (search by title)
 * - sort: 'newest' or 'oldest' (sort by creation date)
 * - page: number (pagination page, default 1)
 * - limit: number (items per page, default 10)
 */
const getAllTasks = async (req, res) => {
  try {
    let filteredTasks = [...tasks];

    // Filter by completion status
    if (req.query.completed !== undefined) {
      const completed = req.query.completed === "true";
      filteredTasks = filteredTasks.filter((task) => task.completed === completed);
    }

    // Search by title (case-insensitive)
    if (req.query.title) {
      const searchTerm = req.query.title.toLowerCase();
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by creation date
    if (req.query.sort) {
      if (req.query.sort === "newest") {
        filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (req.query.sort === "oldest") {
        filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    const totalCount = filteredTasks.length;
    const totalPages = Math.ceil(totalCount / limit);

    sendSuccess(res, 200, "Tasks retrieved successfully", {
      tasks: paginatedTasks,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    sendError(res, 500, "Error retrieving tasks");
  }
};

/**
 * GET /tasks/:id
 * Retrieves a single task by ID
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    sendSuccess(res, 200, "Task retrieved successfully", task);
  } catch (error) {
    sendError(res, 500, "Error retrieving task");
  }
};

/**
 * POST /tasks
 * Creates a new task
 * Request body:
 * - title: string (required)
 * - description: string (optional)
 * - completed: boolean (optional, default false)
 */
const createTask = async (req, res) => {
  try {
    const { title, description = "", completed = false } = req.body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim() === "") {
      return sendError(res, 400, "Title is required and must be a non-empty string");
    }

    // Validate optional fields
    if (description && typeof description !== "string") {
      return sendError(res, 400, "Description must be a string");
    }

    if (typeof completed !== "boolean") {
      return sendError(res, 400, "Completed must be a boolean");
    }

    const newTask = {
      id: getNextId(),
      title: title.trim(),
      description: description.trim(),
      completed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.push(newTask);

    sendSuccess(res, 201, "Task created successfully", newTask);
  } catch (error) {
    sendError(res, 500, "Error creating task");
  }
};

/**
 * PUT /tasks/:id
 * Updates an existing task
 * Request body: Any of { title, description, completed }
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    // Update only provided fields
    const { title, description, completed } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return sendError(res, 400, "Title must be a non-empty string");
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return sendError(res, 400, "Description must be a string");
      }
      task.description = description.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return sendError(res, 400, "Completed must be a boolean");
      }
      task.completed = completed;
    }

    // Always update the updatedAt timestamp
    task.updatedAt = new Date();

    sendSuccess(res, 200, "Task updated successfully", task);
  } catch (error) {
    sendError(res, 500, "Error updating task");
  }
};

/**
 * DELETE /tasks/:id
 * Deletes a task by ID
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return sendError(res, 404, "Task not found");
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    sendSuccess(res, 200, "Task deleted successfully", deletedTask[0]);
  } catch (error) {
    sendError(res, 500, "Error deleting task");
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
