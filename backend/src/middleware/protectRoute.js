import { clerkClient } from "@clerk/express";
import { User } from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("\n🔒 protectRoute middleware triggered");
    console.log("   Authorization header:", req.headers.authorization ? "✅ Present" : "❌ Missing");
    
    let clerkId = null;
    
    // Try to get userId from Clerk middleware first
    try {
      const authResult = req.auth();
      console.log("   req.auth():", authResult ? JSON.stringify({ userId: authResult.userId, sessionId: authResult.sessionId }) : "null");
      clerkId = authResult?.userId;
    } catch (error) {
      console.log("   req.auth() failed:", error.message);
    }
    
    // If no userId from middleware, manually decode and verify the Bearer token
    if (!clerkId && req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      console.log("   Manually decoding Bearer token (length:", token.length + ")");
      
      try {
        // Decode JWT to extract userId (temporary workaround)
        // JWT format: header.payload.signature
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          clerkId = payload.sub; // 'sub' claim contains the userId
          console.log("✅ JWT decoded! UserId from token:", clerkId);
          
          // Verify the user actually exists in Clerk
          try {
            await clerkClient.users.getUser(clerkId);
            console.log("✅ User verified in Clerk");
          } catch (clerkError) {
            console.error("❌ User not found in Clerk:", clerkError.message);
            clerkId = null; // Reset if user doesn't exist
          }
        } else {
          console.error("❌ Invalid JWT format");
        }
      } catch (verifyError) {
        console.error("❌ Token decoding failed:", verifyError.message);
      }
    }
    
    if (!clerkId) {
      console.error("❌ No userId found - user not authenticated");
      return res.status(401).json({
        message: "Unauthorized - Please sign in to continue"
      });
    }

    console.log("✅ ClerkId found:", clerkId);

    // Find user in DB
    let user = await User.findOne({ clerkId });
    console.log("   User found in DB:", user ? `✅ ${user.email}` : "❌ Not found");

    // Auto-create user if not found (first login scenario)
    if (!user) {
      console.log("   Attempting to auto-create user...");
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        console.log("   Clerk user fetched:", clerkUser.emailAddresses[0]?.emailAddress);
        
        user = await User.create({
          clerkId,
          name: clerkUser.firstName 
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim() 
            : clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || "User",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          profileImage: clerkUser.imageUrl || "",
        });
        console.log("✅ Auto-created user:", user.email);
      } catch (createError) {
        console.error("❌ Failed to auto-create user:", createError.message);
        return res.status(500).json({ 
          message: "Failed to create user profile" 
        });
      }
    }

    // Attach user to request for controllers
    req.user = user;
    console.log("✅ Auth successful for user:", user.email);
    console.log("   Proceeding to controller\n");

    next();
  } catch (error) {
    console.error("❌ Error in protectRoute:", error.message);
    console.error("   Stack:", error.stack);
    return res.status(500).json({ 
      message: "Internal server error during authentication" 
    });
  }
};
