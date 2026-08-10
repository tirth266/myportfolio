/**
 * Task Manager REST API — Practical 5
 *
 * Connects to MongoDB via Mongoose, then starts the Express server.
 * All middleware from Practical 4 is preserved.
 */

// Load environment variables first (must be before any process.env usage)
require("dotenv").config();

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const logger       = require("./middleware/logger");
const validateJson = require("./middleware/validateJson");
const notFound     = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes   = require("./routes/taskRoutes");

const app  = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========

app.use(cors());

// Request logging middleware (Practical 4 — logs to console + CSV)
app.use(logger);

// Body parser middleware (built-in to Express)
app.use(express.json());

// JSON content-type validation middleware (Practical 4)
app.use(validateJson);

// ========== ROUTES ==========

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success:   true,
    message:   "Task Manager API is running",
    version:   "2.0.0",
    practical: "Practical 5 — MongoDB + Mongoose",
    endpoints: "/tasks",
  });
});

// Task routes
app.use("/tasks", taskRoutes);

// ========== ERROR HANDLING ==========

// 404 handler — must come after all routes
app.use(notFound);

// Global error handler — must be last middleware
app.use(errorHandler);

// ========== MONGODB CONNECTION + SERVER START ==========

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "\n[ERROR] MONGO_URI is not set.\n" +
    "Create a .env file in the /backend directory and add:\n" +
    "  MONGO_URI=your_mongodb_connection_string\n" +
    "See .env.example for the expected format.\n"
  );
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Task Manager REST API Server         ║
║   Running on http://localhost:${PORT}   ║
╚════════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    // Log only the message — never log the URI or credentials
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
