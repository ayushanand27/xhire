import { chatClient } from "../lib/stream.js";
import { Chat } from "../models/Chat.js";
import { Room } from "../models/Room.js";
import { User } from "../models/User.js";

// Get Stream token for real-time chat via Stream.io
export async function getStreamToken(req, res) {
  try {
    // use clerkId for Stream (not mongodb _id)=> it should match the id we have in the stream dashboard
    const token = chatClient.createToken(req.user.clerkId);

    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      userImage: req.user.image,
    });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get chat history for a room
export const getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify room exists and user has access
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.isParticipant(req.user.id)) {
      return res
        .status(403)
        .json({ error: "You don't have access to this room" });
    }

    // Get paginated chat history
    const messages = await Chat.find({ roomId })
      .populate("senderId", "name profileImage email")
      .populate("mentionedUsers", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Chat.countDocuments({ roomId });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
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

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const user = await User.findById(req.user.id);
    const participant = room.getParticipant(req.user.id);

    if (!participant) {
      return res.status(403).json({ error: "You are not a participant in this room" });
    }

    // Check if user has chat permission
    if (!participant.permissions.canChat) {
      return res.status(403).json({ error: "You don't have permission to chat" });
    }

    const newMessage = new Chat({
      roomId,
      senderId: req.user.id,
      senderName: user.name,
      senderAvatar: user.profileImage,
      message,
      messageType,
      codeLanguage: messageType === "code" ? codeLanguage : null,
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate(
      "senderId",
      "name profileImage email"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.isParticipant(req.user.id)) {
      return res
        .status(403)
        .json({ error: "You don't have access to this room" });
    }

    const messages = await Chat.find({
      roomId,
      message: { $regex: query, $options: "i" },
    })
      .populate("senderId", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(messages);
  } catch (error) {
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

    const chatMessage = await Chat.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user is sender or room creator
    const room = await Room.findById(roomId);
    if (
      chatMessage.senderId.toString() !== req.user.id &&
      room.creator.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "You can't edit this message" });
    }

    chatMessage.message = message;
    chatMessage.isEdited = true;
    chatMessage.editedAt = new Date();

    await chatMessage.save();
    res.json(chatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { roomId, messageId } = req.params;

    const chatMessage = await Chat.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const room = await Room.findById(roomId);
    if (
      chatMessage.senderId.toString() !== req.user.id &&
      room.creator.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "You can't delete this message" });
    }

    await Chat.findByIdAndDelete(messageId);
    res.json({ message: "Message deleted successfully" });
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

    const chatMessage = await Chat.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    const user = await User.findById(req.user.id);

    // Check if user already reacted with this emoji
    const existingReaction = chatMessage.reactions.find(
      (r) =>
        r.emoji === emoji && r.userId.toString() === req.user.id
    );

    if (existingReaction) {
      // Remove reaction if already exists
      chatMessage.reactions = chatMessage.reactions.filter(
        (r) => !(r.emoji === emoji && r.userId.toString() === req.user.id)
      );
    } else {
      // Add new reaction
      chatMessage.reactions.push({
        emoji,
        userId: req.user.id,
        userName: user.name,
      });
    }

    await chatMessage.save();
    res.json(chatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
