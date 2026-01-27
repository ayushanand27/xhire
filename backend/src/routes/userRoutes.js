import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getMe,
  getUserPreferences,
  updateUserPreferences,
  addFavoriteRoom,
  removeFavoriteRoom,
  getFavoriteRooms,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../controllers/userController.js";

const router = Router();

// All routes require authentication
router.use(protectRoute);

// Current user
router.get("/me", getMe);

// User preferences
router.get("/preferences", getUserPreferences);
router.put("/preferences", updateUserPreferences);

// Favorite rooms
router.get("/favorites", getFavoriteRooms);
router.post("/favorites", addFavoriteRoom);
router.delete("/favorites/:roomId", removeFavoriteRoom);

// Blocked users
router.get("/blocked", getBlockedUsers);
router.post("/blocked", blockUser);
router.delete("/blocked/:userId", unblockUser);

export default router;
