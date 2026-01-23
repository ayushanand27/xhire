import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getRoomActivity,
  getUserActivity,
  getActivityByType,
  getRoomStats,
} from "../controllers/activityController.js";

const router = Router({ mergeParams: true }); // Allow access to roomId param

// All routes require authentication
router.use(protectRoute);

// Room activity
router.get("/", getRoomActivity);
router.get("/type/:eventType", getActivityByType);
router.get("/stats", getRoomStats);

// User activity (different route)
router.get("/user/:userId", getUserActivity);

export default router;
