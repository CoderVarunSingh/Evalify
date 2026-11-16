import User from "../models/User.js";

/**
 * POST /api/users/register
 * Called after a user signs up. Creates the user record in DB with their role.
 * If user already exists (re-signup), it does NOT change the role.
 */
export const registerUser = async (req, res) => {
  try {
    const { role, name, email, imageUrl } = req.body;
    const clerkId = req.auth().userId;

    if (!clerkId) return res.status(401).json({ message: "Unauthorized" });

    // Check if user already exists — never allow role downgrade/change via this endpoint
    let user = await User.findOne({ clerkId });

    if (user) {
      // User already exists — return existing user (role is locked)
      return res.status(200).json({ user, alreadyExists: true });
    }

    // Validate role
    const allowedRoles = ["interviewee", "interviewer", "admin"];
    const assignedRole = allowedRoles.includes(role) ? role : "interviewee";

    // Create new user with locked role
    user = await User.create({
      clerkId,
      name: name || "User",
      email: email || "",
      profileImage: imageUrl || "",
      role: assignedRole,
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * GET /api/users/me
 * Returns the current authenticated user's profile from DB (including role).
 * This is the server-side source of truth for role-based authorization.
 */
export const getMe = async (req, res) => {
  try {
    // Log incoming Authorization header for debugging
    console.log('Authorization header:', req.headers.authorization);

    const clerkId = req.auth().userId;
    console.log('Authenticated Clerk ID:', clerkId);
    if (!clerkId) return res.status(401).json({ message: "Unauthorized" });

    let user = await User.findOne({ clerkId });
    if (!user) {
      console.warn(`User not found for clerkId ${clerkId}. Creating default user record.`);
      // Auto‑create a minimal user record with default role
      user = await User.create({
        clerkId,
        name: "Anonymous",
        email: `${clerkId}@example.com`,
        profileImage: "",
        role: "interviewee",
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
