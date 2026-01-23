import express from "express";
import {
  getStreamToken,
  getChatHistory,
  sendMessage,
  searchMessages,
  editMessage,
  deleteMessage,
  addReaction,
} from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router({ mergeParams: true }); // Allow access to roomId param

// All routes require authentication
router.use(protectRoute);

// Stream token
router.get("/token", getStreamToken);

// Chat history and search
router.get("/history", getChatHistory);
router.get("/search", searchMessages);

// Send message
router.post("/", sendMessage);

// Message management (by messageId)
router.put("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

// Reactions
router.post("/:messageId/reactions", addReaction);

export default router;
