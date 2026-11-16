// In-memory sliding window rate limiter (zero external dependencies required)
const ipRequestMap = new Map();

// Periodic cleanup of stale records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    if (now > record.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Express rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 mins)
 * @param {number} options.max - Max requests allowed per window (default: 300)
 * @param {string} options.message - Error message on limit exceeded
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins
  const max = options.max || 300;
  const message = options.message || "Too many requests from this IP, please try again later.";

  return (req, res, next) => {
    // Skip rate limiting for health check
    if (req.path === "/health") {
      return next();
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let record = ipRequestMap.get(ip);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipRequestMap.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetSeconds);

    if (record.count > max) {
      res.setHeader("Retry-After", resetSeconds);
      return res.status(429).json({
        error: "Too Many Requests",
        message,
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  };
}

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
