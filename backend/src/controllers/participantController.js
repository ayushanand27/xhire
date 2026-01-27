import { Room } from "../models/Room.js";

// GET ALL PARTICIPANTS IN A ROOM
export const getParticipants = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).populate("participants.userId", "name email clerkId avatar");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      participants: room.participants,
      count: room.participants.length,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
};

// UPDATE PARTICIPANT ROLE
export const updateParticipantRole = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId, participantId } = req.params;
    const { role } = req.body;

    // Verify role is valid
    if (!["creator", "presenter", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can change roles
    if (!room.isCreator(userId)) {
      return res.status(403).json({ error: "Only room creator can change participant roles" });
    }

    // Can't demote yourself from creator
    if (userId === participantId && role !== "creator") {
      return res.status(400).json({ error: "You cannot remove yourself as creator" });
    }

    const success = await room.updateParticipantRole(participantId, role);

    if (!success) {
      return res.status(404).json({ error: "Participant not found in room" });
    }

    res.json({
      message: "Participant role updated",
      participant: room.getParticipant(participantId),
    });
  } catch (error) {
    console.error("Error updating participant role:", error);
    res.status(500).json({ error: "Failed to update participant role" });
  }
};

// UPDATE PARTICIPANT PERMISSIONS
export const updateParticipantPermissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId, participantId } = req.params;
    const { permissions } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can change permissions
    if (!room.isCreator(userId)) {
      return res.status(403).json({ error: "Only room creator can change permissions" });
    }

    // Validate permissions object
    const validPermissionKeys = ["canEdit", "canExecute", "canScreenShare", "canChat", "canMute"];
    const invalidKeys = Object.keys(permissions).filter((key) => !validPermissionKeys.includes(key));

    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: `Invalid permission keys: ${invalidKeys.join(", ")}` });
    }

    const success = await room.updateParticipantPermissions(participantId, permissions);

    if (!success) {
      return res.status(404).json({ error: "Participant not found in room" });
    }

    res.json({
      message: "Participant permissions updated",
      participant: room.getParticipant(participantId),
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ error: "Failed to update permissions" });
  }
};

// REMOVE PARTICIPANT FROM ROOM
export const removeParticipant = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId, participantId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can remove participants
    if (!room.isCreator(userId)) {
      return res.status(403).json({ error: "Only room creator can remove participants" });
    }

    // Can't remove yourself
    if (userId === participantId) {
      return res.status(400).json({ error: "Cannot remove yourself from room. Use leave instead." });
    }

    await room.removeParticipant(participantId);

    res.json({ message: "Participant removed from room" });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ error: "Failed to remove participant" });
  }
};

// UPDATE PARTICIPANT MEDIA STATUS (muted, camera off, screen sharing)
export const updateParticipantMediaStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;
    const { isMuted, isCameraOff, isScreenSharing } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participant = room.getParticipant(userId);

    if (!participant) {
      return res.status(403).json({ error: "You are not a participant in this room" });
    }

    // Check permissions
    if (isScreenSharing && !participant.permissions.canScreenShare) {
      return res.status(403).json({ error: "You do not have permission to screen share" });
    }

    if (isMuted !== undefined) participant.isMuted = isMuted;
    if (isCameraOff !== undefined) participant.isCameraOff = isCameraOff;
    if (isScreenSharing !== undefined) participant.isScreenSharing = isScreenSharing;

    await room.save();

    res.json({
      message: "Media status updated",
      participant,
    });
  } catch (error) {
    console.error("Error updating media status:", error);
    res.status(500).json({ error: "Failed to update media status" });
  }
};

// GET PARTICIPANT BY ID
export const getParticipantDetails = async (req, res) => {
  try {
    const { roomId, participantId } = req.params;

    const room = await Room.findById(roomId).populate("participants.userId", "name email clerkId avatar");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participant = room.getParticipant(participantId);

    if (!participant) {
      return res.status(404).json({ error: "Participant not found in room" });
    }

    res.json(participant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    res.status(500).json({ error: "Failed to fetch participant" });
  }
};
