import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getParticipants,
  getParticipantDetails,
  updateParticipantRole,
  updateParticipantPermissions,
  removeParticipant,
  updateParticipantMediaStatus,
} from "../controllers/participantController.js";

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protectRoute);

// Get all participants in room
router.get("/", getParticipants);

// Get specific participant details
router.get("/:participantId", getParticipantDetails);

// Update participant role (creator only)
router.put("/:participantId/role", updateParticipantRole);

// Update participant permissions (creator only)
router.put("/:participantId/permissions", updateParticipantPermissions);

// Remove participant from room (creator only)
router.delete("/:participantId", removeParticipant);

// Update participant media status (self)
router.put("/:participantId/media-status", updateParticipantMediaStatus);

export default router;
