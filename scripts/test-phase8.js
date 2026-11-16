import { getCache, setCache, delCache, flushCache, getCacheStats } from "../backend/src/lib/cache.js";
import { createRateLimiter } from "../backend/src/middleware/rateLimiter.js";
import { verifyJwtNative } from "../backend/src/middleware/jwtAuth.js";
import { validateBody } from "../backend/src/middleware/validator.js";
import crypto from "crypto";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=========================================");
  console.log(" Evalify - Phase 8 Optimization Tests");
  console.log("=========================================\n");

  // 1. In-Memory Cache Tests
  console.log("--- 1. Cache Engine Tests ---");
  await flushCache();
  await setCache("test:key", { value: 42 }, 10);
  const cachedVal = await getCache("test:key");
  assert(cachedVal && cachedVal.value === 42, "Cache correctly stores and retrieves objects");

  await delCache("test:key");
  const deletedVal = await getCache("test:key");
  assert(deletedVal === null, "Cache deletion correctly removes items");

  const stats = getCacheStats();
  assert(typeof stats.hits === "number" && typeof stats.misses === "number", "Cache statistics are recorded properly");

  // 2. Rate Limiter Tests
  console.log("\n--- 2. Rate Limiter Middleware Tests ---");
  const testLimiter = createRateLimiter({ windowMs: 1000, max: 2 });
  const mockReq = { ip: "127.0.0.1", headers: {}, socket: { remoteAddress: "127.0.0.1" } };
  let statusSet = null;
  const mockRes = {
    headers: {},
    setHeader(name, val) { this.headers[name] = val; },
    status(code) { statusSet = code; return { json: () => {} }; }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  // Request 1
  testLimiter(mockReq, mockRes, next);
  assert(nextCalled && mockRes.headers["RateLimit-Remaining"] === 1, "First request passes with decrement remaining");

  // Request 2
  nextCalled = false;
  testLimiter(mockReq, mockRes, next);
  assert(nextCalled && mockRes.headers["RateLimit-Remaining"] === 0, "Second request passes with 0 remaining");

  // Request 3 (Should be rate limited)
  nextCalled = false;
  testLimiter(mockReq, mockRes, next);
  assert(!nextCalled && statusSet === 429, "Third request exceeded limit and received 429");

  // 3. Native JWT Verification Tests
  console.log("\n--- 3. Native JWT Security Tests ---");
  const secret = "test_secret_key_12345";
  const headerB64 = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify({ userId: "user_test_99", role: "interviewer" })).toString("base64url");
  const sigB64 = crypto.createHmac("sha256", secret).update(`${headerB64}.${payloadB64}`).digest("base64url");
  const validToken = `${headerB64}.${payloadB64}.${sigB64}`;

  const decoded = verifyJwtNative(validToken, secret);
  assert(decoded.userId === "user_test_99" && decoded.role === "interviewer", "Valid JWT verified successfully");

  let threwTampered = false;
  try {
    verifyJwtNative(`${headerB64}.${payloadB64}.tampered_signature`, secret);
  } catch (e) {
    threwTampered = true;
  }
  assert(threwTampered, "Tampered JWT rejected with error");

  // 4. Request Validation Middleware Tests
  console.log("\n--- 4. Request Validation Tests ---");
  const validator = validateBody({
    problem: { required: true, type: "string", minLength: 2 },
    difficulty: { required: true, enum: ["easy", "medium", "hard"] }
  });

  let valStatus = 200;
  const valRes = {
    status(code) { valStatus = code; return { json: () => {} }; }
  };
  let valNext = false;

  // Invalid body
  validator({ body: { problem: "A", difficulty: "invalid" } }, valRes, () => { valNext = true; });
  assert(!valNext && valStatus === 400, "Invalid payload correctly rejected with status 400");

  // Valid body
  valStatus = 200;
  valNext = false;
  validator({ body: { problem: "Two Sum", difficulty: "easy" } }, valRes, () => { valNext = true; });
  assert(valNext && valStatus === 200, "Valid payload correctly accepted");

  console.log("\n=========================================");
  console.log(` Results: ${passed} passed, ${failed} failed`);
  console.log("=========================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
