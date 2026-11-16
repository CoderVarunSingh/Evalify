/**
 * Lightweight Schema Validation Middleware (zero external dependencies)
 * Validates req.body, req.query, or req.params against standard rules.
 */

export function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    for (const [field, rule] of Object.entries(rules)) {
      const val = body[field];

      if (rule.required && (val === undefined || val === null || val === "")) {
        errors.push(`${field} is required`);
        continue;
      }

      if (val !== undefined && val !== null && val !== "") {
        if (rule.type === "string" && typeof val !== "string") {
          errors.push(`${field} must be a string`);
        } else if (rule.type === "number" && typeof val !== "number") {
          errors.push(`${field} must be a number`);
        } else if (rule.enum && !rule.enum.includes(val)) {
          errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
        } else if (rule.minLength && typeof val === "string" && val.length < rule.minLength) {
          errors.push(`${field} must have at least ${rule.minLength} characters`);
        } else if (rule.maxLength && typeof val === "string" && val.length > rule.maxLength) {
          errors.push(`${field} cannot exceed ${rule.maxLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        messages: errors,
      });
    }

    next();
  };
}
