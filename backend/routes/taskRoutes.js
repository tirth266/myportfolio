/**
 * Task Routes — Practical 7
 *
 * These are the protected CRUD routes. Every single one of them follows the
 * same pipeline, which is the whole point of the practical:
 *
 *   Client -> Auth Middleware -> Validation Middleware -> Controller
 *
 * router.use(requireAuth) applies the JWT check to EVERY route declared
 * below it, so there is no way to accidentally add an unprotected task
 * endpoint later — forgetting to type the middleware on one line is not
 * enough to expose it.
 *
 * The cache debug endpoints from Practical 9 also sit below router.use(),
 * so they are authenticated too.
 */

const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");
const requireAuth = require("../middleware/auth");
const validateTaskId = require("../middleware/validateTaskId");
const validateJson = require("../middleware/validateJson");
const { validate, rules } = require("../middleware/validate");

// ---- STEP 1: Auth middleware (runs for every route below) ------------------
router.use(requireAuth);

// ---- STEP 2 & 3: Validation middleware + controller, per route -------------

// GET /api/tasks — list all tasks (served from the in-memory cache when warm).
// No body to validate, so it is auth -> controller only.
router.get("/", taskController.getAllTasks);

// GET /api/tasks/cache/stats — Practical 9 cache hit/miss counters.
// MUST be declared before "/:id", otherwise Express would match "/cache" as a
// task id and return 400 Invalid task ID.
router.get("/cache/stats", taskController.getCacheStats);

// POST /api/tasks/cache/reset — flush cache + zero counters (testing helper)
router.post("/cache/reset", taskController.resetCacheStats);

// GET /api/tasks/:id — auth -> validate the id -> controller
router.get("/:id", validateTaskId, taskController.getTaskById);

// POST /api/tasks — auth -> validate the JSON body -> controller
router.post("/", validateJson, validate(rules.createTask), taskController.createTask);

// PUT /api/tasks/:id — auth -> validate id -> validate body -> controller
router.put(
  "/:id",
  validateTaskId,
  validateJson,
  validate(rules.updateTask),
  taskController.updateTask
);

// DELETE /api/tasks/:id — auth -> validate the id -> controller
router.delete("/:id", validateTaskId, taskController.deleteTask);

module.exports = router;
