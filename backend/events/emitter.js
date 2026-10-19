/**
 * Application Event Emitter — Practical 10
 * Centralized EventEmitter instance using Node.js built-in 'node:events'.
 * Decouples request-response lifecycles from heavy background tasks.
 */

const EventEmitter = require("node:events");

class AppEventEmitter extends EventEmitter {}

// Create a single shared instance for the application
const appEmitter = new AppEventEmitter();

// Increase max listeners if needed to avoid memory leak warnings
appEmitter.setMaxListeners(20);

module.exports = appEmitter;
