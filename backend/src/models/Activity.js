import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "joined",
        "left",
        "code-executed",
        "code-shared",
        "screen-shared",
        "camera-toggled",
        "mic-toggled",
        "message-sent",
        "role-changed",
        "permissions-changed",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Can store additional data like:
      // { codeLanguage: "javascript", executionTime: 150, status: "success" }
      // { duration: 3600 } for joined/left
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
activitySchema.index({ roomId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
