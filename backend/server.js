/**
 * Task Manager REST API
 * A production-quality REST API for task management
 * 
 * Server runs on http://localhost:3000
 */

const express = require("express");
const logger = require("./middleware/logger");
const validateJson = require("./middleware/validateJson");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========

// Request logging middleware
app.use(logger);

// Body parser middleware (built-in to Express)
app.use(express.json());

// JSON content-type validation middleware
app.use(validateJson);

// ========== ROUTES ==========

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Manager API is running",
    version: "1.0.0",
    endpoints: "/tasks",
  });
});

// Task routes
app.use("/tasks", taskRoutes);

// ========== ERROR HANDLING ==========

// 404 handler (must be after all other routes)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// ========== START SERVER ==========

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Task Manager REST API Server         ║
║   Running on http://localhost:${PORT}   ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
