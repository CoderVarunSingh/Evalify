import { requireAuth } from '@clerk/express';
import User from '../models/User.js';

export const protectRoute = [
    requireAuth(), // This middleware checks if the user is authenticated using Clerk
    async (req, res, next) => {
        try {
            // Get the user ID from the authenticated request
            const clerkId = req.auth().userId;
            if(!clerkId) return res.status(401).json({ msg: "Unauthorized" });

            // Find the user in the database using the Clerk ID
            const user = await User.findOne({ clerkId });
            if (!user) return res.status(404).json({ msg: "User not found" });

            req.user = user;

            next();
            
        } catch (error) {
            console.error("Error in protectRoute middleware:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
];