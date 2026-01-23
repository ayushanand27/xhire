import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["creator", "presenter", "viewer"],
    default: "viewer",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  permissions: {
    canEdit: { type: Boolean, default: true },
    canExecute: { type: Boolean, default: true },
    canScreenShare: { type: Boolean, default: true },
    canChat: { type: Boolean, default: true },
    canMute: { type: Boolean, default: true },
  },
  isMuted: { type: Boolean, default: false },
  isCameraOff: { type: Boolean, default: false },
  isScreenSharing: { type: Boolean, default: false },
});

const roomConfigSchema = new mongoose.Schema({
  recordingEnabled: { type: Boolean, default: true },
  chatEnabled: { type: Boolean, default: true },
  screenShareEnabled: { type: Boolean, default: true },
  codeEditorEnabled: { type: Boolean, default: true },
  whiteboardEnabled: { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 5 },
  allowMembershipChangeOnJoin: { type: Boolean, default: false },
});

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomType: {
      type: String,
      enum: ["interview", "pair-programming", "team-meeting", "study-group", "general"],
      default: "general",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null, // null = no password required
    },
    participants: [participantSchema],
    config: roomConfigSchema,
    sharedCode: {
      language: { type: String, default: "javascript" },
      code: { type: String, default: "" },
      lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      lastEditedAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    tags: [String], // for filtering/searching rooms
    recordingUrl: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null, // null = no expiration
    },
  },
  { timestamps: true }
);

// Index for quick lookups
roomSchema.index({ creator: 1, createdAt: -1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ isPublic: 1 });
roomSchema.index({ "participants.userId": 1 });
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for participant count
roomSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Method to check if user is participant
roomSchema.methods.isParticipant = function (userId) {
  return this.participants.some((p) => p.userId.equals(userId));
};

// Method to check if user is creator
roomSchema.methods.isCreator = function (userId) {
  return this.creator.equals(userId);
};

// Method to get participant data
roomSchema.methods.getParticipant = function (userId) {
  return this.participants.find((p) => p.userId.equals(userId));
};

// Method to check if room is full
roomSchema.methods.isFull = function () {
  return this.participants.length >= this.config.maxParticipants;
};

// Method to check if room is locked
roomSchema.methods.isLocked = function () {
  return this.password !== null;
};

// Method to add participant
roomSchema.methods.addParticipant = async function (userId, role = "viewer") {
  if (this.isParticipant(userId)) {
    return false; // Already a participant
  }

  if (this.isFull()) {
    return false; // Room is full
  }

  this.participants.push({
    userId,
    role,
    joinedAt: new Date(),
  });

  await this.save();
  return true;
};

// Method to remove participant
roomSchema.methods.removeParticipant = async function (userId) {
  this.participants = this.participants.filter((p) => !p.userId.equals(userId));
  await this.save();
};

// Method to update participant role
roomSchema.methods.updateParticipantRole = async function (userId, newRole) {
  const participant = this.getParticipant(userId);
  if (participant) {
    participant.role = newRole;
    await this.save();
    return true;
  }
  return false;
};

// Method to update participant permissions
roomSchema.methods.updateParticipantPermissions = async function (userId, permissions) {
  const participant = this.getParticipant(userId);
  if (participant) {
    participant.permissions = { ...participant.permissions, ...permissions };
    await this.save();
    return true;
  }
  return false;
};

export const Room = mongoose.model("Room", roomSchema);
