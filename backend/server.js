/**
 * Portfolio REST API — Practical 7: Authentication and Middleware Pipeline
 * Node.js + Express.js + MongoDB (Mongoose ODM) + JWT
 *
 * Middleware order in this file matters:
 *   logger -> cors -> express.json() -> routes -> notFound -> errorHandler
 *
 * Within a protected route the order is:
 *   auth.js -> validate.js -> controller
 */

// Load environment variables before any other logic
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiRoutes = require("./routes/aiRoutes"); // Practical 13
const { registerListeners } = require("./events/listeners");

// Practical 10: Initialize asynchronous event-driven listeners
registerListeners();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  if (!MONGO_URI) {
    console.error("\n[ERROR] MONGO_URI is not defined in backend/.env");
    console.error("Please create backend/.env with your MongoDB connection string.\n");
    process.exit(1);
  }

  // Practical 7: fail loudly at startup instead of throwing a confusing
  // 500 on the first login. The secret must never be committed to git.
  if (!process.env.JWT_SECRET) {
    console.error("\n[ERROR] JWT_SECRET is not defined in backend/.env");
    console.error("Add a long random string, e.g. JWT_SECRET=" + "a".repeat(48) + "\n");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("\nMongoDB connected successfully");
    return app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║   Portfolio REST API Server (Practical 7)      ║
║   Running on http://localhost:${PORT}             ║
║   Auth: JWT Bearer tokens, 1h expiry           ║
║   Database: MongoDB via Mongoose ODM            ║
║   CORS: http://localhost:5173                  ║
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error("[ERROR] MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ========== MIDDLEWARE PIPELINE ==========

// 1. Global request logging middleware (METHOD URL - TIMESTAMP)
app.use(logger);

// 2. CORS middleware — allow frontend origin (dev server & containerized Nginx)
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:80,http://localhost")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Built-in body parser for JSON payloads
app.use(express.json());

// ========== ROUTES ==========

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio REST API is running",
    practical: "Practical 7 — Authentication and Middleware Pipeline",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      me: "GET /api/auth/me",
      getAllTasks: "GET /api/tasks",
      getTaskById: "GET /api/tasks/:id",
      createTask: "POST /api/tasks",
      updateTask: "PUT /api/tasks/:id",
      deleteTask: "DELETE /api/tasks/:id",
      cacheStats: "GET /api/tasks/cache/stats",
      cacheReset: "POST /api/tasks/cache/reset",
      generateDescription: "POST /api/ai/generate-description", // Practical 13
    },
  });
});

// ========== /api ROUTES (Practical 7) ==========
// Everything now lives under /api, which is the prefix the practical uses.
// The old /auth and /tasks mounts are kept directly underneath so the React
// app and the backend tests that still call /tasks keep working.

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes); // Practical 13: AI API integration

// Practical 9: Debug endpoint exposing in-memory cache hit/miss counters
app.get("/api/debug/cache-stats", (req, res) => {
  const taskCache = require("./cache/taskCache");
  res.status(200).json({
    success: true,
    message: "In-memory cache statistics",
    ...taskCache.getStats(),
  });
});

// Legacy aliases — same routers, older paths. Kept so nothing breaks.
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/messages", messageRoutes);

// ========== ERROR HANDLING ==========

// 404 Handler for undefined routes (must come after all valid routes)
app.use(notFound);

// Centralized Global Error Handler (must be last middleware)
app.use(errorHandler);

// ========== DATABASE CONNECTION & SERVER STARTUP ==========

if (process.env.NODE_ENV !== "test" || process.env.RUN_TEST_SERVER === "true") {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
