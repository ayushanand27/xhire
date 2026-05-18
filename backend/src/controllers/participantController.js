import { prisma } from "../lib/prisma.js";
import {
  buildParticipantPermissions,
  ensurePrismaUser,
  mapParticipant,
  normalizeParticipantRole,
} from "../lib/prismaAdapters.js";

async function getRoomForParticipantOps(roomId) {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      creator: true,
      participants: { include: { user: true } },
    },
  });
}

// GET ALL PARTICIPANTS IN A ROOM
export const getParticipants = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await getRoomForParticipantOps(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      participants: await Promise.all(room.participants.map(mapParticipant)),
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
    const { roomId, participantId } = req.params;
    const { role } = req.body;
    const currentUser = await ensurePrismaUser(req.user);

    // Verify role is valid
    if (!["creator", "presenter", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const room = await getRoomForParticipantOps(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can change roles
    if (room.creatorId !== currentUser.id) {
      return res.status(403).json({ error: "Only room creator can change participant roles" });
    }

    // Can't demote yourself from creator
    const targetParticipant = room.participants.find((participant) => participant.userId === participantId);
    if (!targetParticipant) {
      return res.status(404).json({ error: "Participant not found in room" });
    }

    if (currentUser.id === participantId && role !== "creator") {
      return res.status(400).json({ error: "You cannot remove yourself as creator" });
    }

    const updated = await prisma.roomParticipant.update({
      where: { id: targetParticipant.id },
      data: { role: normalizeParticipantRole(role) },
      include: { user: true },
    });

    res.json({
      message: "Participant role updated",
      participant: mapParticipant(updated),
    });
  } catch (error) {
    console.error("Error updating participant role:", error);
    res.status(500).json({ error: "Failed to update participant role" });
  }
};

// UPDATE PARTICIPANT PERMISSIONS
export const updateParticipantPermissions = async (req, res) => {
  try {
    const { roomId, participantId } = req.params;
    const { permissions } = req.body;
    const currentUser = await ensurePrismaUser(req.user);

    const room = await getRoomForParticipantOps(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can change permissions
    if (room.creatorId !== currentUser.id) {
      return res.status(403).json({ error: "Only room creator can change permissions" });
    }

    // Validate permissions object
    const validPermissionKeys = ["canEdit", "canExecute", "canScreenShare", "canChat", "canMute"];
    const invalidKeys = Object.keys(permissions).filter((key) => !validPermissionKeys.includes(key));

    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: `Invalid permission keys: ${invalidKeys.join(", ")}` });
    }

    const targetParticipant = room.participants.find((participant) => participant.userId === participantId);
    if (!targetParticipant) {
      return res.status(404).json({ error: "Participant not found in room" });
    }

    const updated = await prisma.roomParticipant.update({
      where: { id: targetParticipant.id },
      data: { permissions: buildParticipantPermissions({ ...(targetParticipant.permissions || {}), ...permissions }) },
      include: { user: true },
    });

    res.json({
      message: "Participant permissions updated",
      participant: mapParticipant(updated),
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ error: "Failed to update permissions" });
  }
};

// REMOVE PARTICIPANT FROM ROOM
export const removeParticipant = async (req, res) => {
  try {
    const { roomId, participantId } = req.params;
    const currentUser = await ensurePrismaUser(req.user);

    const room = await getRoomForParticipantOps(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can remove participants
    if (room.creatorId !== currentUser.id) {
      return res.status(403).json({ error: "Only room creator can remove participants" });
    }

    // Can't remove yourself
    if (currentUser.id === participantId) {
      return res.status(400).json({ error: "Cannot remove yourself from room. Use leave instead." });
    }

    const targetParticipant = room.participants.find((participant) => participant.userId === participantId);
    if (!targetParticipant) {
      return res.status(404).json({ error: "Participant not found in room" });
    }

    await prisma.roomParticipant.delete({ where: { id: targetParticipant.id } });

    res.json({ message: "Participant removed from room" });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ error: "Failed to remove participant" });
  }
};

// UPDATE PARTICIPANT MEDIA STATUS (muted, camera off, screen sharing)
export const updateParticipantMediaStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { isMuted, isCameraOff, isScreenSharing } = req.body;
    const currentUser = await ensurePrismaUser(req.user);

    const room = await getRoomForParticipantOps(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participant = room.participants.find((p) => p.userId === currentUser.id);

    if (!participant) {
      return res.status(403).json({ error: "You are not a participant in this room" });
    }

    // Check permissions
    if (isScreenSharing && !(participant.permissions?.canScreenShare ?? true)) {
      return res.status(403).json({ error: "You do not have permission to screen share" });
    }

    const updated = await prisma.roomParticipant.update({
      where: { id: participant.id },
      data: {
        ...(isMuted !== undefined ? { isMuted } : {}),
        ...(isCameraOff !== undefined ? { isCameraOff } : {}),
        ...(isScreenSharing !== undefined ? { isScreenSharing } : {}),
      },
      include: { user: true },
    });

    res.json({
      message: "Media status updated",
      participant: mapParticipant(updated),
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

    const room = await getRoomForParticipantOps(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participant = room.participants.find((p) => p.userId === participantId);

    if (!participant) {
      return res.status(404).json({ error: "Participant not found in room" });
    }

    res.json(mapParticipant(participant));
  } catch (error) {
    console.error("Error fetching participant:", error);
    res.status(500).json({ error: "Failed to fetch participant" });
  }
};
