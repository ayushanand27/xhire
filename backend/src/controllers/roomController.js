import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { streamClient } from "../lib/stream.js";

// CREATE A NEW ROOM
export const createRoom = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { name, description, roomType, isPublic, password, config, tags } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Room name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newRoom = new Room({
      name: name.trim(),
      description: description || "",
      creator: userId,
      roomType: roomType || "general",
      isPublic: isPublic !== undefined ? isPublic : false,
      password: password || null,
      config: config || {},
      tags: tags || [],
    });

    // Add creator as participant with creator role
    await newRoom.addParticipant(userId, "creator");

    // Create Stream channel for video/chat
    const channel = streamClient.channel("messaging", newRoom._id.toString(), {
      members: [userId],
      name: name,
      custom: {
        roomType,
        maxParticipants: newRoom.config.maxParticipants,
      },
    });
    await channel.create();

    const savedRoom = await newRoom.save();

    res.status(201).json({
      message: "Room created successfully",
      room: savedRoom,
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

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [search] } },
      ];
    }

    if (roomType) {
      filter.roomType = roomType;
    }

    if (isPublic !== undefined) {
      filter.isPublic = isPublic === "true";
    }

    // If userId provided, show rooms where user is a participant or rooms are public
    if (userId) {
      filter.$or = [
        { "participants.userId": userId },
        { isPublic: true },
      ];
    }

    filter.status = "active";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rooms = await Room.find(filter)
      .populate("creator", "name email clerkId")
      .populate("participants.userId", "name email clerkId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Room.countDocuments(filter);

    res.json({
      rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
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

    const room = await Room.findById(roomId)
      .populate("creator", "name email clerkId")
      .populate("participants.userId", "name email clerkId")
      .populate("sharedCode.lastEditedBy", "name email");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
};

// JOIN A ROOM
export const joinRoom = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await Room.findById(roomId)
      .populate("creator", "name email")
      .populate("participants.userId", "name email");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if room is locked with password
    if (room.isLocked() && room.password !== password) {
      return res.status(403).json({ error: "Invalid room password" });
    }

    // Check if user is already a participant
    if (room.isParticipant(userId)) {
      return res.status(400).json({ error: "You are already in this room" });
    }

    // Check if room is full
    if (room.isFull()) {
      return res.status(400).json({ error: "Room is full" });
    }

    // Add user as participant
    await room.addParticipant(userId, "viewer");

    // Add user to Stream channel
    const channel = streamClient.channel("messaging", roomId);
    await channel.addMembers([userId]);

    // Emit event that user joined
    res.json({
      message: "Successfully joined room",
      room,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
};

// LEAVE A ROOM
export const leaveRoom = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.isParticipant(userId)) {
      return res.status(400).json({ error: "You are not a participant in this room" });
    }

    // If creator leaves and no other participants, archive the room
    if (room.isCreator(userId) && room.participants.length === 1) {
      room.status = "inactive";
      await room.save();
    } else {
      await room.removeParticipant(userId);

      // Remove from Stream channel
      const channel = streamClient.channel("messaging", roomId);
      await channel.removeMembers([userId]);
    }

    res.json({ message: "Successfully left the room" });
  } catch (error) {
    console.error("Error leaving room:", error);
    res.status(500).json({ error: "Failed to leave room" });
  }
};

// UPDATE ROOM
export const updateRoom = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { roomId } = req.params;
    const { name, description, config, tags, isPublic, password } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can update room
    if (!room.isCreator(userId)) {
      return res.status(403).json({ error: "Only room creator can update settings" });
    }

    if (name) room.name = name;
    if (description !== undefined) room.description = description;
    if (config) room.config = { ...room.config, ...config };
    if (tags) room.tags = tags;
    if (isPublic !== undefined) room.isPublic = isPublic;
    if (password !== undefined) room.password = password;

    await room.save();

    res.json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
};

// DELETE ROOM
export const deleteRoom = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Only creator can delete room
    if (!room.isCreator(userId)) {
      return res.status(403).json({ error: "Only room creator can delete the room" });
    }

    // Delete Stream channel
    const channel = streamClient.channel("messaging", roomId);
    await channel.delete();

    await Room.findByIdAndDelete(roomId);

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
};

// GET STREAM TOKEN FOR VIDEO/CHAT
export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { roomId } = req.params;

    // Verify user is in room
    const room = await Room.findById(roomId);
    if (!room || !room.isParticipant(userId)) {
      return res.status(403).json({ error: "Not a participant in this room" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate Stream token
    const token = streamClient.createToken(user.clerkId || userId.toString());

    res.json({
      token,
      userId: user.clerkId || userId.toString(),
      userName: user.name,
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

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participant = room.getParticipant(req.user.id);
    if (!participant) {
      return res.status(403).json({ error: "You are not a participant in this room" });
    }

    if (!participant.permissions.canExecute) {
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

      res.json({
        success: true,
        language,
        code,
        output: result.run.stdout || result.run.stderr || "No output",
        error: result.run.stderr,
        executionTime: result.run.signal || "0ms",
      });
    } catch (executionError) {
      res.status(500).json({
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
