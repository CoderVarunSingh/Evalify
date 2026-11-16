import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  getSessionStats,
  joinSession,
} from "../controllers/sessionController.js";

import { validateBody } from "../middleware/validator.js";

const router = express.Router();

router.post(
  "/",
  protectRoute,
  validateBody({
    problem: { required: true, type: "string", minLength: 2 },
    difficulty: { required: true, enum: ["easy", "medium", "hard"] },
  }),
  createSession
);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);
router.get("/stats", protectRoute, getSessionStats);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);

export default router;
