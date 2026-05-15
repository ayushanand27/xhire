import mongoose from "mongoose";

const qaTurnSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answerText: { type: String, default: "" },
    answerSource: {
      type: String,
      enum: ["text", "audio-transcribed"],
      default: "text",
    },
    askedAt: { type: Date, default: Date.now },
    answeredAt: { type: Date, default: null },
  },
  { _id: false }
);

const scoreSchema = new mongoose.Schema(
  {
    technical: { type: Number, min: 0, max: 100, default: null },
    communication: { type: Number, min: 0, max: 100, default: null },
    confidence: { type: Number, min: 0, max: 100, default: null },
    behavioral: { type: Number, min: 0, max: 100, default: null },
    overall: { type: Number, min: 0, max: 100, default: null },
  },
  { _id: false }
);

const proctorEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "eye_contact_low",
        "face_not_visible",
        "multiple_faces_detected",
        "tab_switch_detected",
        "screen_share_stopped",
        "suspicious_movement",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mock", "proctored"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "terminated", "rejected"],
      default: "scheduled",
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "AI Interview",
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    resumeText: { type: String, default: "" },
    jobDescriptionText: { type: String, default: "" },
    extractedSkills: { type: [String], default: [] },
    resumeJdMatchScore: { type: Number, min: 0, max: 100, default: null },

    transcript: { type: [qaTurnSchema], default: [] },
    lastQuestion: { type: String, default: "" },

    proctoring: {
      webcamEnabled: { type: Boolean, default: false },
      screenShareEnabled: { type: Boolean, default: false },
      faceVisible: { type: Boolean, default: false },
      warningsCount: { type: Number, default: 0, min: 0, max: 3 },
      warningLevel: {
        type: String,
        enum: ["none", "warning_1", "warning_2", "warning_3"],
        default: "none",
      },
      events: { type: [proctorEventSchema], default: [] },
    },

    evaluation: {
      scores: { type: scoreSchema, default: () => ({}) },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      improvementSuggestions: { type: [String], default: [] },
      behavioralInsights: { type: [String], default: [] },
      reviewedByHuman: { type: Boolean, default: false },
      antiBiasNotes: { type: String, default: "" },
      generatedAt: { type: Date, default: null },
    },

    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

interviewSchema.index({ candidate: 1, createdAt: -1 });
interviewSchema.index({ recruiter: 1, createdAt: -1 });

const Interview = mongoose.model("Interview", interviewSchema);

export { Interview };
