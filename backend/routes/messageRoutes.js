/**
 * Message Routes — Practical 10: Asynchronous Processing with Event-Driven Architecture
 */

const express = require("express");
const router = express.Router();

const {
  createMessageSync,
  createMessageAsync,
  triggerFaultyTest,
  getAllMessages,
} = require("../controllers/messageController");

// Public contact endpoints
router.post("/sync", createMessageSync);
router.post("/", createMessageAsync);
router.post("/fault-test", triggerFaultyTest);
router.get("/", getAllMessages);

module.exports = router;
