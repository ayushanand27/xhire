import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getMe,
  updateMe,
  getDirectory,
  recruiterDashboard,
} from "../controllers/userControllerV2.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get current user
router.get("/me", getMe);

// Update current user
router.put("/me", updateMe);

// Get candidate directory (recruiter only)
router.get("/directory", getDirectory);

// Recruiter dashboard
router.get("/recruiter/dashboard", recruiterDashboard);

export default router;
