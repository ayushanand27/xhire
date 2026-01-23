import mongoose from "mongoose";

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    roomPreferences: {
      defaultLayout: {
        type: String,
        enum: ["grid", "focus", "sidebar"],
        default: "grid",
      },
      autoStartCamera: {
        type: Boolean,
        default: true,
      },
      autoStartMicrophone: {
        type: Boolean,
        default: false,
      },
      defaultVolume: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
    },
    codePreferences: {
      defaultLanguage: {
        type: String,
        default: "javascript",
      },
      fontSize: {
        type: Number,
        min: 10,
        max: 32,
        default: 14,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "monokai", "dracula"],
        default: "dark",
      },
      indentSize: {
        type: Number,
        default: 2,
      },
    },
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      soundNotifications: {
        type: Boolean,
        default: true,
      },
      desktopNotifications: {
        type: Boolean,
        default: true,
      },
      notifyOnUserJoin: {
        type: Boolean,
        default: true,
      },
      notifyOnCodeExecution: {
        type: Boolean,
        default: false,
      },
    },
    privacySettings: {
      allowScreenRecording: {
        type: Boolean,
        default: true,
      },
      allowAnalytics: {
        type: Boolean,
        default: true,
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
    },
    favoritedRooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("UserPreferences", userPreferencesSchema);
