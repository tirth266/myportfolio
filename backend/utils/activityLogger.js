/**
 * Activity Logger — Practical 6
 *
 * Appends a CSV row to backend/logs/activity.csv after every task API operation.
 *
 * CSV format:
 *   timestamp,method,url,status,details
 *
 * Handles:
 *  - Creates the logs/ directory and activity.csv (with header) if they don't exist.
 *  - Proper CSV escaping: fields containing commas, double-quotes, or newlines are
 *    wrapped in double-quotes; embedded double-quotes are escaped as "".
 *  - Never logs secrets (no URI, no tokens, no passwords).
 *  - Appends — never truncates existing entries on restart.
 */

const fs   = require("fs");
const path = require("path");

const LOG_DIR  = path.join(__dirname, "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "activity.csv");
const CSV_HEADER = "timestamp,method,url,status,details";

// ── Ensure logs directory and CSV file exist (with header only) ──────────────
function ensureLogFile() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, CSV_HEADER + "\n", "utf8");
  }
}

// ── RFC-4180-compliant CSV field escaping ────────────────────────────────────
function escapeField(value) {
  const str = String(value == null ? "" : value);
  // Wrap in quotes if field contains comma, double-quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ── Core append function ─────────────────────────────────────────────────────
/**
 * @param {string} method   - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url      - Request URL path (e.g. /tasks, /tasks/abc123)
 * @param {number} status   - HTTP status code
 * @param {string} details  - Human-readable description (task title, error message)
 */
function logActivity(method, url, status, details) {
  try {
    ensureLogFile();

    const timestamp = new Date().toISOString();
    const row = [
      escapeField(timestamp),
      escapeField(method),
      escapeField(url),
      escapeField(status),
      escapeField(details),
    ].join(",");

    fs.appendFileSync(LOG_FILE, row + "\n", "utf8");
  } catch (err) {
    // Never crash the server over a logging failure
    console.error("[ActivityLogger] Failed to write log:", err.message);
  }
}

module.exports = { logActivity };
