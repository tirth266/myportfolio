/**
 * LEGACY — Practical 4 in-memory storage
 *
 * This file was the data store for Practical 4.
 * As of Practical 5, all task data is stored in MongoDB via the Mongoose Task model
 * (see models/Task.js). This file is no longer imported or used by the application.
 *
 * Kept for reference only. Do not delete — it documents the Practical 4 implementation.
 */

/**
 * In-memory task storage
 * This simulates a database for demonstration purposes
 */

let tasks = [
  {
    id: 1,
    title: "Learn Express.js",
    description: "Complete the Express.js middleware practical",
    completed: false,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: 2,
    title: "Build REST API",
    description: "Create a production-ready REST API",
    completed: true,
    createdAt: new Date("2024-01-10T14:20:00Z"),
    updatedAt: new Date("2024-01-18T16:45:00Z"),
  },
  {
    id: 3,
    title: "Test with Postman",
    description: "Set up and test all API endpoints",
    completed: false,
    createdAt: new Date("2024-01-20T09:15:00Z"),
    updatedAt: new Date("2024-01-20T09:15:00Z"),
  },
];

let nextId = 4;

module.exports = {
  tasks,
  getNextId: () => nextId++,
};
