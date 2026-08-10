/**
 * Global Logger Middleware
 *
 * Responsibilities:
 *  1. Logs every HTTP request to the terminal in a readable format
 *  2. Appends a structured row to logs/activity.csv after each response
 *
 * CSV columns: timestamp, action, method, url, status, details
 *
 * Design notes:
 *  - Uses only Node.js built-in modules (fs, path) — no extra packages.
 *  - CSV writes are async (fs.appendFile) so they never block the response.
 *  - Write errors are caught and printed; they never crash the API.
 *  - The logs/ directory and activity.csv header are created automatically
 *    on first startup if they do not already exist.
 *  - When authentication is added later, pass a `user` field to appendToCsv
 *    and add it as an extra column — the rest of the code stays the same.
 */

const fs   = require('fs');
const path = require('path');

// ── CSV file paths ─────────────────────────────────────────────────────────────

const LOGS_DIR  = path.join(__dirname, '..', 'logs');
const CSV_FILE  = path.join(LOGS_DIR, 'activity.csv');
const CSV_HEADER = 'timestamp,action,method,url,status,details\n';

// ── One-time setup: create logs/ dir and CSV file if they don't exist ──────────

function ensureCsvExists() {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    if (!fs.existsSync(CSV_FILE)) {
      fs.writeFileSync(CSV_FILE, CSV_HEADER, 'utf8');
    }
  } catch (err) {
    // Non-fatal — the API keeps running even if logging can't initialise
    console.error('[Logger] Could not initialise log file:', err.message);
  }
}

ensureCsvExists();

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns a "YYYY-MM-DD HH:MM:SS" timestamp string in local time.
 */
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    ` ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}

/**
 * Returns a short human-readable description for the CSV "details" column.
 * Based on method, URL path, and final HTTP status code.
 */
function getDetails(method, url, statusCode) {
  // Error cases first (status-code driven)
  if (statusCode >= 500) return 'Server error';
  if (statusCode === 415) return 'Invalid content-type';
  if (statusCode === 404) return 'Route not found';
  if (statusCode === 400) return 'Bad request';

  // Success cases (method + path driven)
  const isTaskById = /^\/tasks\/\d+/.test(url);

  if (method === 'GET'    && url.startsWith('/tasks') && !isTaskById) return 'Tasks fetched';
  if (method === 'POST'   && url === '/tasks')                        return 'Task created';
  if (method === 'GET'    && isTaskById)                              return 'Task retrieved';
  if (method === 'PUT'    && isTaskById)                              return 'Task updated';
  if (method === 'DELETE' && isTaskById)                              return 'Task deleted';

  return 'Request processed';
}

/**
 * Escapes a single CSV field value:
 *   - Wraps in double-quotes if the value contains a comma, newline, or quote.
 *   - Escapes any embedded double-quotes by doubling them ("").
 */
function escapeCsvField(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Appends one row to the CSV file asynchronously.
 * Any I/O error is logged to the console and silently swallowed — it must
 * never propagate to the caller or affect the HTTP response.
 *
 * @param {{ timestamp, action, method, url, status, details }} row
 */
function appendToCsv(row) {
  const line = [
    row.timestamp,
    row.action,
    row.method,
    row.url,
    row.status,
    row.details,
  ]
    .map(escapeCsvField)
    .join(',') + '\n';

  fs.appendFile(CSV_FILE, line, 'utf8', (err) => {
    if (err) {
      console.error('[Logger] CSV write error:', err.message);
    }
  });
}

// ── Middleware function ────────────────────────────────────────────────────────

const logger = (req, res, next) => {
  const startTime = Date.now();
  const method    = req.method;
  const url       = req.originalUrl;

  // Intercept res.send so we can read the final status code and duration
  // after the controller has finished building the response.
  const originalSend = res.send;

  res.send = function (data) {
    const duration   = Date.now() - startTime;
    const statusCode = res.statusCode;
    const timestamp  = getTimestamp();
    const details    = getDetails(method, url, statusCode);

    // ── 1. Terminal log ──────────────────────────────────────────────────────
    console.log(`[${timestamp}] ${method} ${url} → ${statusCode} (${duration}ms)`);

    // ── 2. CSV log (async, non-blocking) ────────────────────────────────────
    appendToCsv({
      timestamp,
      action:  'REQUEST',
      method,
      url,
      status:  statusCode,
      details,
    });

    // Call the original send to finish the response normally
    return originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
