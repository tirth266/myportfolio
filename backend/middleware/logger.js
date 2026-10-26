/**
 * Global Request Logger Middleware (Practical 4)
 * Logs: METHOD URL - TIMESTAMP
 */

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${req.method} ${req.originalUrl || req.url} - ${timestamp}`);
  next();
};

module.exports = logger;
