import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["interviewee", "interviewer", "admin"],
      default: "interviewee",
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
