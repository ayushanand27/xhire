import { chatClient } from "../lib/stream.js";
import { prisma } from "../lib/prisma.js";
import {
  ensurePrismaUser,
  mapPrismaUser,
  normalizeMessageType,
  toApiMessageType,
} from "../lib/prismaAdapters.js";

// Get Stream token for real-time chat via Stream.io
export async function getStreamToken(req, res) {
  try {
    const currentUser = await ensurePrismaUser(req.user);

    const client = chatClient.getInstance();
    const token = client.createToken(currentUser.clerkId);

    res.status(200).json({
      token,
      userId: currentUser.clerkId,
      userName: currentUser.name,
      userImage: currentUser.profileImage,
    });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getRoomForChat(roomId, currentUserId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      creator: true,
      participants: { include: { user: true } },
    },
  });

  if (!room) return null;

  const isParticipant = room.participants.some((p) => p.userId === currentUserId);
  if (!isParticipant && room.creatorId !== currentUserId) {
    const error = new Error("You don't have access to this room");
    error.statusCode = 403;
    throw error;
  }

  return room;
}

function mapMessage(message, userMap = new Map()) {
  const sender = message.sender ? mapPrismaUser(message.sender) : null;

  return {
    id: message.id,
    roomId: message.roomId,
    senderId: sender || message.senderId,
    senderName: message.senderName,
    senderAvatar: message.senderAvatar || "",
    message: message.message,
    messageType: toApiMessageType(message.messageType),
    codeLanguage: message.codeLanguage || null,
    isEdited: message.isEdited,
    editedAt: message.editedAt,
    reactions: message.reactions || [],
    mentionedUsers: Array.isArray(message.mentionedUsers)
      ? message.mentionedUsers.map((id) => userMap.get(id) || id)
      : [],
    createdAt: message.createdAt,
  };
}

async function hydrateMentionUsers(messages) {
  const mentionedIds = [...new Set(messages.flatMap((m) => m.mentionedUsers || []))];
  if (mentionedIds.length === 0) return new Map();

  const users = await prisma.user.findMany({
    where: { id: { in: mentionedIds } },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      profileImage: true,
      role: true,
      skills: true,
      yearsOfExperience: true,
    },
  });

  return new Map(users.map((user) => [user.id, mapPrismaUser(user)]));
}

// Get chat history for a room
export const getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const currentUser = await ensurePrismaUser(req.user);

    // Verify room exists and user has access
    const room = await getRoomForChat(roomId, currentUser.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Get paginated chat history
    const messages = await prisma.chat.findMany({
      where: { roomId },
      include: {
        sender: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    const mentionUserMap = await hydrateMentionUsers(messages);

    const mappedMessages = messages
      .map((message) => mapMessage(message, mentionUserMap))
      .reverse();

    const totalMessages = await prisma.chat.count({ where: { roomId } });

    return res.json({
      messages: mappedMessages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalMessages,
        pages: Math.ceil(totalMessages / limitNum),
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Send a message (primary method via WebSocket, but REST fallback)
export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, messageType = "text", codeLanguage } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const currentUser = await ensurePrismaUser(req.user);
    const room = await getRoomForChat(roomId, currentUser.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const participant = room.participants.find((p) => p.userId === currentUser.id);

    if (!participant) {
      return res.status(403).json({ error: "You are not a participant in this room" });
    }

    // Check if user has chat permission
    if (!(participant.permissions?.canChat ?? true)) {
      return res.status(403).json({ error: "You don't have permission to chat" });
    }

    const newMessage = await prisma.chat.create({
      data: {
        roomId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.profileImage,
        message,
        messageType: normalizeMessageType(messageType),
        codeLanguage: messageType === "code" ? codeLanguage || null : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
    });

    return res.status(201).json(mapMessage(newMessage));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.query;

    const currentUser = await ensurePrismaUser(req.user);

    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const room = await getRoomForChat(roomId, currentUser.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const messages = await prisma.chat.findMany({
      where: {
        roomId,
        message: { contains: query, mode: "insensitive" },
      },
      include: {
        sender: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const mentionUserMap = await hydrateMentionUsers(messages);

    return res.json(messages.map((message) => mapMessage(message, mentionUserMap)));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Edit a message (only by sender or room creator)
export const editMessage = async (req, res) => {
  try {
    const { roomId, messageId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const currentUser = await ensurePrismaUser(req.user);
    const chatMessage = await prisma.chat.findUnique({
      where: { id: messageId },
    });
    if (!chatMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user is sender or room creator
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (chatMessage.senderId !== currentUser.id && room.creatorId !== currentUser.id) {
      return res.status(403).json({ error: "You can't edit this message" });
    }

    const updated = await prisma.chat.update({
      where: { id: messageId },
      data: {
        message,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            profileImage: true,
            role: true,
            skills: true,
            yearsOfExperience: true,
          },
        },
      },
    });

    return res.json(mapMessage(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { roomId, messageId } = req.params;

    const currentUser = await ensurePrismaUser(req.user);
    const chatMessage = await prisma.chat.findUnique({ where: { id: messageId } });
    if (!chatMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (chatMessage.senderId !== currentUser.id && room.creatorId !== currentUser.id) {
      return res.status(403).json({ error: "You can't delete this message" });
    }

    await prisma.chat.delete({ where: { id: messageId } });
    return res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { roomId, messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: "Emoji required" });
    }

    const currentUser = await ensurePrismaUser(req.user);
    const chatMessage = await prisma.chat.findUnique({
      where: { id: messageId },
    });
    if (!chatMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const user = currentUser;

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if user already reacted with this emoji
    const reactions = Array.isArray(chatMessage.reactions) ? [...chatMessage.reactions] : [];
    const existingReaction = reactions.find(
      (r) => r.emoji === emoji && r.userId === currentUser.id
    );

    if (existingReaction) {
      // Remove reaction if already exists
      const updatedReactions = reactions.filter(
        (r) => !(r.emoji === emoji && r.userId === currentUser.id)
      );
      const updated = await prisma.chat.update({
        where: { id: messageId },
        data: { reactions: updatedReactions },
        include: {
          sender: {
            select: {
              id: true,
              clerkId: true,
              name: true,
              email: true,
              profileImage: true,
              role: true,
              skills: true,
              yearsOfExperience: true,
            },
          },
        },
      });

      return res.json(mapMessage(updated));
    } else {
      // Add new reaction
      reactions.push({
        emoji,
        userId: currentUser.id,
        userName: user.name,
      });

      const updated = await prisma.chat.update({
        where: { id: messageId },
        data: { reactions },
        include: {
          sender: {
            select: {
              id: true,
              clerkId: true,
              name: true,
              email: true,
              profileImage: true,
              role: true,
              skills: true,
              yearsOfExperience: true,
            },
          },
        },
      });

      return res.json(mapMessage(updated));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
