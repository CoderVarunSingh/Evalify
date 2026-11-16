import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { fileURLToPath } from "url";
import fs from "fs";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import Problem from "./models/Problem.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import pistonRoutes from "./routes/pistonRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { apiLimiter } from "./middleware/rateLimiter.js";
import { auditLog } from "./middleware/auditLog.js";
import { optionalJwtAuth } from "./middleware/jwtAuth.js";
import { getCache, setCache, getCacheStats } from "./lib/cache.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core Middlewares
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like health checks, same-origin, curl) or any configured client
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(clerkMiddleware());
app.use(optionalJwtAuth);
app.use(auditLog);

// Global API Rate Limiting
app.use("/api", apiLimiter);

// External compiler execution routes
app.use("/api/piston", pistonRoutes);

// Problem routes with caching
const problemRouter = express.Router();
problemRouter.get("/", async (req, res) => {
  try {
    const cacheKey = "problems:all";
    const cached = await getCache(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    const problems = await Problem.find({}).sort({ createdAt: -1 });
    await setCache(cacheKey, problems, 60); // 60s TTL
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(problems);
  } catch (err) {
    console.error("Error fetching problems:", err);
    res.status(500).json({ message: "Server error" });
  }
});

problemRouter.get("/:id", async (req, res) => {
  try {
    const cacheKey = `problem:${req.params.id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    await setCache(cacheKey, problem, 120); // 120s TTL
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(problem);
  } catch (err) {
    console.error("Error fetching problem by id:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/problems", problemRouter);
app.use("/api/users", userRoutes);

// Health check with cache diagnostics
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    msg: "Evalify API is operational",
    timestamp: new Date().toISOString(),
    cache: getCacheStats(),
  });
});

// Deployment static files (serves frontend build if present)
const possibleDistPaths = [
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(process.cwd(), "frontend/dist"),
  path.resolve(process.cwd(), "dist"),
];
const frontendDist = possibleDistPaths.find((p) => fs.existsSync(p));

if (frontendDist) {
  app.use(express.static(frontendDist));

  app.get("/{*any}", (req, res, next) => {
    // Guard: API routes that do not exist should return 404 JSON, not HTML
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: `API route ${req.path} not found` });
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  console.log("📦 Serving frontend build from:", frontendDist);
} else {
  console.log("ℹ️ Frontend dist not found - operating in API-only mode");
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
