import express from "express";
import { requireAuth } from "@clerk/express";
import { registerUser, getMe } from "../controllers/userController.js";
import { validateBody } from "../middleware/validator.js";

const router = express.Router();

// POST /api/users/register - called after signup to lock role in DB
router.post(
  "/register",
  requireAuth(),
  validateBody({
    role: { required: false, enum: ["interviewee", "interviewer", "admin"] },
  }),
  registerUser
);

// GET /api/users/me - fetch current user's role from DB (source of truth)
router.get("/me", requireAuth(), getMe);

export default router;
