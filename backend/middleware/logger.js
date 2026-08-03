/**
 * Global Logger Middleware
 * Logs all incoming requests with method, URL, response time, and status code
 */

const logger = (req, res, next) => {
  const startTime = Date.now();
  const method = req.method;
  const url = req.originalUrl;

  // Capture the original send function
  const originalSend = res.send;

  // Override the send function to log response details
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    console.log(
      `${method} ${url} | Status ${statusCode} | ${duration}ms`
    );

    // Call the original send function
    return originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
