import { requireAuth, clerkClient } from "@clerk/express";
import { User } from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // Auto-create user if not found (first login scenario)
      if (!user) {
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          user = await User.create({
            clerkId,
            name: clerkUser.firstName 
              ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim() 
              : clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || "User",
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            profileImage: clerkUser.imageUrl || "",
          });
          console.log("Auto-created user:", user.email);
        } catch (createError) {
          console.error("Failed to auto-create user:", createError);
          return res.status(404).json({ message: "User not found and could not be created" });
        }
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
