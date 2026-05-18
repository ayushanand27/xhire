import { streamClient } from "../lib/stream.js";
import { ENV } from "../lib/env.js";
import { sendInviteEmail } from "../lib/email.js";
import { prisma } from "../lib/prisma.js";
import {
  buildParticipantPermissions,
  buildRoomConfig,
  ensurePrismaUser,
  mapRoom,
  normalizeParticipantRole,
  normalizeRoomType,
  resolveUserId,
} from "../lib/prismaAdapters.js";

async function getRoomWithAccess(roomId, userId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      creator: true,
      participants: { include: { user: true } },
    },
  });

  if (!room) return null;

  const isParticipant = room.participants.some((p) => p.userId === userId);
  if (!isParticipant && room.creatorId !== userId) {
    const error = new Error("You don't have access to this room");
    error.statusCode = 403;
    throw error;
  }

  return room;
}

// CREATE A NEW ROOM
export const createRoom = async (req, res) => {
  try {
    const user = await ensurePrismaUser(req.user);
    const { name, description, roomType, isPublic, password, config, tags } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Room name is required" });
    }

    const roomConfig = buildRoomConfig(config);

    const newRoom = await prisma.room.create({
      data: {
        name: name.trim(),
        description: description || "",
        creatorId: user.id,
        roomType: normalizeRoomType(roomType),
        isPublic: isPublic !== undefined ? Boolean(isPublic) : false,
        password: password || null,
        config: roomConfig,
        tags: tags || [],
        participants: {
          create: {
            userId: user.id,
            role: normalizeParticipantRole("creator"),
            joinedAt: new Date(),
            permissions: buildParticipantPermissions(),
            isMuted: false,
            isCameraOff: false,
            isScreenSharing: false,
          },
        },
      },
      include: {
        creator: true,
        participants: { include: { user: true } },
      },
    });

    // Create Stream chat channel (messaging)
    const client = streamClient.getInstance();
    const channel = client.channel("messaging", newRoom.id.toString(), {
      members: [user.clerkId],
      name: name,
      custom: {
        roomType: roomType || "general",
        maxParticipants: roomConfig.maxParticipants,
      },
    });
    await channel.create();

    return res.status(201).json({
      message: "Room created successfully",
      room: await mapRoom(newRoom),
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

// GET ALL ROOMS (with filtering)
export const getAllRooms = async (req, res) => {
  try {
    const { search, roomType, isPublic, userId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const andClauses = [];

    if (search) {
      andClauses.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ],
      });
    }

    if (userId) {
      const resolvedUser = await resolveUserId(userId);
      if (resolvedUser) {
        andClauses.push({
          OR: [
            { participants: { some: { userId: resolvedUser.id } } },
            { isPublic: true },
          ],
        });
      }
    }

    const where = {
      status: "ACTIVE",
      ...(roomType ? { roomType: normalizeRoomType(roomType) } : {}),
      ...(isPublic !== undefined ? { isPublic: isPublic === "true" } : {}),
      ...(andClauses.length ? { AND: andClauses } : {}),
    };

    const rooms = await prisma.room.findMany({
      where,
      include: {
        creator: true,
        participants: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    const total = await prisma.room.count({ where });

    return res.json({
      rooms: await Promise.all(rooms.map((room) => mapRoom(room))),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

// GET SINGLE ROOM
export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: true,
        participants: { include: { user: true } },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.json(await mapRoom(room, { populateEditor: true }));
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
};

// JOIN A ROOM
export const joinRoom = async (req, res) => {
  try {
    const user = await ensurePrismaUser(req.user);
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: true,
        participants: { include: { user: true } },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if room is locked with password
    if (room.password && room.password !== password) {
      return res.status(403).json({ error: "Invalid room password" });
    }

    // Check if user is already a participant
    if (room.participants.some((participant) => participant.userId === user.id)) {
      return res.status(400).json({ error: "You are already in this room" });
    }

    // Check if room is full
    const maxParticipants = room.config?.maxParticipants || 6;
    if (room.participants.length >= maxParticipants) {
      return res.status(400).json({ error: "Room is full" });
    }

    // Add user as participant
    await prisma.roomParticipant.create({
      data: {
        roomId,
        userId: user.id,
        role: normalizeParticipantRole("viewer"),
        joinedAt: new Date(),
        permissions: buildParticipantPermissions(),
        isMuted: false,
        isCameraOff: false,
        isScreenSharing: false,
      },
    });

    // Add user to Stream channel
    const client = streamClient.getInstance();
    const channel = client.channel("messaging", roomId);
    await channel.addMembers([req.user.clerkId]);

    // Emit event that user joined
    const refreshedRoom = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: true,
        participants: { include: { user: true } },
      },
    });

    return res.json({
      message: "Successfully joined room",
      room: await mapRoom(refreshedRoom),
    });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
};

// LEAVE A ROOM
export const leaveRoom = async (req, res) => {
  try {
    const user = await ensurePrismaUser(req.user);
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: true,
        participants: true,
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participantRecord = room.participants.find((p) => p.userId === user.id);
    if (!participantRecord) {
      return res.status(400).json({ error: "You are not a participant in this room" });
    }

    // If creator leaves and no other participants, archive the room
    if (room.creatorId === user.id && room.participants.length === 1) {
      await prisma.room.update({
        where: { id: roomId },
        data: { status: "INACTIVE" },
      });
      await prisma.roomParticipant.delete({
        where: { id: participantRecord.id },
      });
    } else {
      await prisma.roomParticipant.delete({
        where: { id: participantRecord.id },
      });

      // Remove from Stream channel
      const client = streamClient.getInstance();
      const channel = client.channel("messaging", roomId);
      await channel.removeMembers([req.user.clerkId]);
    }

    return res.json({ message: "Successfully left the room" });
  } catch (error) {
    console.error("Error leaving room:", error);
    res.status(500).json({ error: "Failed to leave room" });
  }
};

// INVITE USER BY EMAIL
export const inviteToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { email, message } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const currentUser = await ensurePrismaUser(req.user);
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: true,
        participants: true,
      },
    });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only participants can invite
    if (!room.participants.some((participant) => participant.userId === currentUser.id)) {
      return res.status(403).json({ error: "You are not a participant in this room" });
    }

    const roomLink = `${ENV.CLIENT_URL}/room/${roomId}`;
    const inviterName = currentUser?.name || currentUser?.email || "xHire";

    await sendInviteEmail({
      to: email,
      roomName: room.name,
      inviterName,
      roomLink,
      message,
    });

    return res.json({ message: "Invite sent" });
  } catch (error) {
    console.error("Error sending invite:", error);
    res.status(500).json({ error: "Failed to send invite" });
  }
};

// UPDATE ROOM
export const updateRoom = async (req, res) => {
  try {
    const user = await ensurePrismaUser(req.user);
    const { roomId } = req.params;
    const { name, description, config, tags, isPublic, password } = req.body;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { creator: true, participants: true },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can update room
    if (room.creatorId !== user.id) {
      return res.status(403).json({ error: "Only room creator can update settings" });
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(config ? { config: buildRoomConfig({ ...(room.config || {}), ...config }) } : {}),
        ...(tags ? { tags } : {}),
        ...(isPublic !== undefined ? { isPublic: Boolean(isPublic) } : {}),
        ...(password !== undefined ? { password } : {}),
      },
      include: {
        creator: true,
        participants: { include: { user: true } },
      },
    });

    return res.json({
      message: "Room updated successfully",
      room: await mapRoom(updated),
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
};

// DELETE ROOM
export const deleteRoom = async (req, res) => {
  try {
    const user = await ensurePrismaUser(req.user);
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { creator: true, participants: true },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can delete room
    if (room.creatorId !== user.id) {
      return res.status(403).json({ error: "Only room creator can delete the room" });
    }

    // Delete Stream channel
    const client = streamClient.getInstance();
    const channel = client.channel("messaging", roomId);
    await channel.delete();

    await prisma.room.delete({ where: { id: roomId } });

    return res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
};

// GET STREAM TOKEN FOR VIDEO/CHAT
export const getStreamToken = async (req, res) => {
  try {
    const user = await ensurePrismaUser(req.user);
    const { roomId } = req.params;

    // Verify user is in room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });
    if (!room || !room.participants.some((participant) => participant.userId === user.id)) {
      return res.status(403).json({ error: "Not a participant in this room" });
    }

    // Generate Stream token
    const client = streamClient.getInstance();
    const token = client.createToken(user.clerkId);

    return res.json({
      token,
      userId: user.clerkId,
      userName: user.name,
      userImage: user.profileImage,
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Failed to generate Stream token" });
  }
};

// Execute code in a room
export const executeCode = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const user = await ensurePrismaUser(req.user);
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participant = room.participants.find((p) => p.userId === user.id);
    if (!participant) {
      return res.status(403).json({ error: "You are not a participant in this room" });
    }

    if (!(participant.permissions?.canExecute ?? true)) {
      return res.status(403).json({ error: "You don't have permission to execute code" });
    }

    // Send code to Piston API for execution
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version: "*",
          files: [{ name: `main.${getFileExtension(language)}`, content: code }],
        }),
      });

      const result = await response.json();

      return res.json({
        success: true,
        language,
        code,
        output: result.run.stdout || result.run.stderr || "No output",
        error: result.run.stderr,
        executionTime: result.run.signal || "0ms",
      });
    } catch (executionError) {
      return res.status(500).json({
        success: false,
        error: "Failed to execute code",
        details: executionError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get file extension based on language
function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    js: "js",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    ruby: "rb",
    go: "go",
    rust: "rs",
    php: "php",
    typescript: "ts",
    tsx: "tsx",
  };
  return extensions[language.toLowerCase()] || language;
};
