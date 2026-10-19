/**
 * Message Controller — Practical 10: Event-Driven Architecture
 * Implements synchronous baseline and asynchronous event-driven contact routes.
 */

const Message = require("../models/Message");
const appEmitter = require("../events/emitter");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. Synchronous Endpoint (Baseline measurement)
 * POST /api/messages/sync
 * Blocks the client request until heavy work (simulated 2s email dispatch) finishes.
 */
const createMessageSync = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Name, email, and message are required" });
    }

    // 1. Save to MongoDB
    const doc = await Message.create({ name, email, message });

    // 2. SLOW INLINE WORK: Blocks the HTTP response for 2000ms
    console.log("[Sync Route] Executing inline email sending (blocking request)...");
    await sleep(2000);
    console.log(`[Sync Route] Finished inline email for ${email}. Now responding to client.`);

    // 3. Finally respond after 2+ seconds
    return res.status(201).json({
      success: true,
      mode: "synchronous",
      message: "Message processed synchronously after inline delay",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Asynchronous Event-Driven Endpoint (Practical 10 Target)
 * POST /api/messages
 * Saves to MongoDB, emits 'messageReceived', and responds immediately with 201.
 * Heavy background tasks (email delivery, logging) execute asynchronously via listeners.
 */
const createMessageAsync = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Name, email, and message are required" });
    }

    // 1. Save to MongoDB
    const doc = await Message.create({ name, email, message });

    // 2. Emit event decoupled from HTTP lifecycle (Do NOT await background listeners)
    appEmitter.emit("messageReceived", doc);

    // 3. Respond immediately to the client with 201 Created
    return res.status(201).json({
      success: true,
      mode: "asynchronous",
      message: "Message received successfully. Background processing started.",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Supplementary Resilience Test
 * POST /api/messages/fault-test
 * Proves that an unhandled error inside a background event listener never breaks the 201 response.
 */
const triggerFaultyTest = async (req, res, next) => {
  try {
    const { name, email, message } = req.body || { name: "Test", email: "test@example.com", message: "Fault test" };
    const doc = await Message.create({
      name: name || "Test User",
      email: email || "fault.tester@example.com",
      message: message || "Testing listener fault tolerance",
    });

    // Emit event that throws internally in listener
    appEmitter.emit("testFaultyListener", doc);

    // Client still receives 201 immediately
    return res.status(201).json({
      success: true,
      mode: "fault-tolerance-test",
      message: "API responded 201 successfully despite background listener exception.",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/messages — Retrieve all saved contact messages
 */
const getAllMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMessageSync,
  createMessageAsync,
  triggerFaultyTest,
  getAllMessages,
};
