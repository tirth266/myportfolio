/**
 * LEGACY — Practical 4 In-Memory Task Storage
 *
 * This file was the data store for Practical 4.
 * As of Practical 5, all task data is stored in MongoDB via the Mongoose Task model
 * (see models/Task.js). This file is no longer imported or used by the application.
 *
 * Preserved for reference and Practical 4 documentation.
 */

let tasks = [
  {
    id: 1,
    title: "Complete Practical 4",
    description: "Build REST API using Express",
    completed: false,
  },
  {
    id: 2,
    title: "Master Express Middleware",
    description: "Implement logging, JSON validation, and error handlers",
    completed: true,
  },
  {
    id: 3,
    title: "Integrate Frontend with REST API",
    description: "Connect React Task Manager UI to backend endpoints",
    completed: false,
  },
];

let nextId = 4;

module.exports = {
  tasks,
  getNextId: () => nextId++,
};
