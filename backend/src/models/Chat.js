import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderAvatar: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "code", "system"],
      default: "text",
    },
    codeLanguage: {
      type: String,
      // e.g., "javascript", "python", "java"
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    reactions: [
      {
        emoji: String,
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        _id: false,
      },
    ],
    mentionedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient querying
chatSchema.index({ roomId: 1, createdAt: -1 });

export const Chat = mongoose.model("Chat", chatSchema);
