/**
 * Event Listeners — Practical 10: Asynchronous Processing with Event-Driven Architecture
 * Background event handlers for decoupled tasks: email notifications & audit logging.
 */

const appEmitter = require("./emitter");
const { logActivity } = require("../utils/activityLogger");

// Helper: simulate non-blocking asynchronous work (e.g. SMTP email delivery)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Register all application event listeners.
 * Every listener is wrapped in try/catch to ensure background errors never crash
 * the Node process or compromise the already-sent HTTP response.
 */
function registerListeners() {
  // ── 1. Primary Event: 'messageReceived' (Contact form submission) ───────────
  
  // Background Email Dispatcher
  appEmitter.on("messageReceived", async (messageData) => {
    try {
      console.log(`[Event: messageReceived] Received payload for ${messageData.email}. Starting async dispatch...`);
      // Simulate heavy email transport delay (2 seconds)
      await sleep(2000);
      console.log(`[Email Service] Notification sent successfully to <${messageData.email}> for message "${messageData.subject || messageData.message?.slice(0, 25)}"`);
    } catch (err) {
      console.error("[Email Service Error] Failed to send email in background:", err.message);
    }
  });

  // Background Audit Logger
  appEmitter.on("messageReceived", async (messageData) => {
    try {
      logActivity("EVENT", "/api/messages", 200, `Decoupled message processed: from ${messageData.name}`);
      console.log(`[Audit Logger] Background activity logged for sender ${messageData.name}`);
    } catch (err) {
      console.error("[Audit Logger Error] Failed to write activity log:", err.message);
    }
  });

  // ── 2. Supplementary Event: 'userRegistered' (Welcome sequence) ────────────
  appEmitter.on("userRegistered", async (userData) => {
    try {
      console.log(`[Event: userRegistered] Welcoming new user ${userData.email}...`);
      await sleep(1000);
      console.log(`[Welcome Service] Welcome email dispatched to ${userData.email}`);
    } catch (err) {
      console.error("[Welcome Service Error] Error in welcome listener:", err.message);
    }
  });

  // ── 3. Supplementary Resilience Listener: Error Isolation Test ──────────────
  appEmitter.on("testFaultyListener", async (data) => {
    try {
      console.log("[Faulty Listener] Triggered with data:", data);
      throw new Error("Simulated background service failure (e.g. SMTP connection timeout)");
    } catch (err) {
      console.error(`[Faulty Listener CAUGHT] Gracefully caught: "${err.message}". Server and HTTP response unharmed.`);
    }
  });

  console.log("Practical 10: Event listeners successfully initialized and attached to appEmitter.");
}

module.exports = { registerListeners };
