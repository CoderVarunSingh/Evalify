import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    category: { type: String, required: true },
    description: {
      text: { type: String, required: true },
      notes: [{ type: String }],
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [{ type: String }],
    starterCode: {
      javascript: String,
      python: String,
      java: String,
    },
    expectedOutput: {
      javascript: String,
      python: String,
      java: String,
    },
  },
  { timestamps: true }
);

// Query optimization indexes
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ title: "text" });

export default mongoose.model("Problem", problemSchema);
