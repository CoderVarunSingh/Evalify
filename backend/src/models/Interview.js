import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    overallScore: { type: Number, min: 0, max: 100 },
    grade: { type: String },
    status: { type: String, enum: ["completed", "in-progress"], default: "completed" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for query performance
interviewSchema.index({ user: 1, date: -1 });
interviewSchema.index({ role: 1 });

export default mongoose.model("Interview", interviewSchema);
