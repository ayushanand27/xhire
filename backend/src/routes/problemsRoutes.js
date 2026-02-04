import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getAllProblems, getProblemById } from "../controllers/problemsController.js";

const router = express.Router();

// Optional auth middleware - doesn't block requests without token
const optionalAuth = (req, res, next) => {
  try {
    // Try to get auth, but don't fail if no token
    const auth = req.auth?.();
    if (auth && auth.userId) {
      console.log("✅ Request has valid Clerk token for user:", auth.userId);
      req.authenticatedUserId = auth.userId;
    } else {
      console.log("⚠️  Request has no auth token - allowing public access to problems");
    }
    next(); // Always proceed
  } catch (error) {
    console.log("⚠️  Auth check error (non-blocking):", error.message);
    next();
  }
};

// Problems routes - work with or without authentication
router.get("/", optionalAuth, getAllProblems);
router.get("/:id", optionalAuth, getProblemById);

export default router;
