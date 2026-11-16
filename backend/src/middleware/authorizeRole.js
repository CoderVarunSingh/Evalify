/**
 * Role-Based Access Control (RBAC) Middleware.
 * Must be placed after authentication middleware (e.g., protectRoute) which attaches req.user.
 *
 * @param {string|string[]} allowedRoles - Role or array of roles permitted to access this route
 */
export const authorizeRole = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - User authentication required" });
    }

    const userRole = req.user.role || "interviewee";
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden - Access denied. Required role: ${roles.join(" or ")}, current: ${userRole}`,
      });
    }

    next();
  };
};
