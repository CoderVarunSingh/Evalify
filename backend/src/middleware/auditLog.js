/**
 * Audit Logging Middleware
 * Records timestamps, HTTP method, route, status code, duration, IP, and authenticated user identity.
 */
export function auditLog(req, res, next) {
  const startTime = Date.now();
  const originalEnd = res.end;

  // Intercept response finish
  res.end = function (...args) {
    res.end = originalEnd;
    res.end.apply(res, args);

    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "-";
    const userId = req.user?._id || req.user?.clerkId || req.auth?.()?.userId || "anonymous";

    // Format audit message
    const timestamp = new Date().toISOString();
    const statusCategory = statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARN" : "INFO";

    // Only log API routes to keep console clean
    if (url.startsWith("/api")) {
      const logLine = `[AUDIT ${statusCategory}] [${timestamp}] ${method} ${url} ${statusCode} - ${duration}ms (User: ${userId}, IP: ${ip})`;
      if (statusCode >= 400) {
        console.warn(logLine);
      } else {
        console.log(logLine);
      }
    }
  };

  next();
}
