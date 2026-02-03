import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createRoom,
  getAllRooms,
  getRoom,
  joinRoom,
  leaveRoom,
  updateRoom,
  deleteRoom,
  inviteToRoom,
  getStreamToken,
  executeCode,
} from "../controllers/roomController.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Room CRUD
router.post("/", createRoom);
router.get("/", getAllRooms);
router.get("/:roomId", getRoom);
router.put("/:roomId", updateRoom);
router.delete("/:roomId", deleteRoom);

// Room participation
router.post("/:roomId/join", joinRoom);
router.post("/:roomId/leave", leaveRoom);
router.post("/:roomId/invite", inviteToRoom);

// Code execution
router.post("/:roomId/execute-code", executeCode);

// Stream integration
router.get("/:roomId/stream-token", getStreamToken);

export default router;
