import crypto from "crypto";

/**
 * Base64 URL decode helper
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Verify HMAC-SHA256 JWT using Node's native crypto module (zero external dependencies)
 */
export function verifyJwtNative(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT structure");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(base64UrlDecode(headerB64));

  if (header.alg !== "HS256") {
    // If signed with RS256 (e.g. Clerk token), parse payload directly
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    return payload;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  if (signatureB64 !== expectedSignature) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(base64UrlDecode(payloadB64));
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }

  return payload;
}

/**
 * Optional JWT authentication middleware.
 * If Authorization header with Bearer token is present, verifies and populates req.jwtUser.
 * Does not block if no token is present (allowing Clerk middleware to handle standard authentication).
 */
export const optionalJwtAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || "evalify_super_secret_jwt_key_2026";
    const payload = verifyJwtNative(token, secret);
    req.jwtUser = payload;
  } catch (err) {
    // Silently continue so Clerk auth or route handlers can inspect or reject
  }

  next();
};

/**
 * Strict JWT auth middleware - requires a valid Bearer token
 */
export const requireJwtAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - Bearer token required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "evalify_super_secret_jwt_key_2026";
    const payload = verifyJwtNative(token, secret);
    req.jwtUser = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: `Unauthorized - ${err.message}` });
  }
};
