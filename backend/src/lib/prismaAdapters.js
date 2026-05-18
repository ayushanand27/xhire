import { prisma } from "./prisma.js";

const ROLE_TO_DB = {
  candidate: "CANDIDATE",
  recruiter: "RECRUITER",
  admin: "ADMIN",
};

const ROLE_TO_API = {
  CANDIDATE: "candidate",
  RECRUITER: "recruiter",
  ADMIN: "admin",
};

const ROOM_TYPE_TO_DB = {
  interview: "INTERVIEW",
  "pair-programming": "PAIR_PROGRAMMING",
  "team-meeting": "TEAM_MEETING",
  "study-group": "STUDY_GROUP",
  general: "GENERAL",
};

const ROOM_TYPE_TO_API = Object.fromEntries(
  Object.entries(ROOM_TYPE_TO_DB).map(([api, db]) => [db, api])
);

const PARTICIPANT_ROLE_TO_DB = {
  creator: "CREATOR",
  presenter: "PRESENTER",
  viewer: "VIEWER",
  interviewer: "INTERVIEWER",
  candidate: "CANDIDATE",
  observer: "OBSERVER",
};

const PARTICIPANT_ROLE_TO_API = Object.fromEntries(
  Object.entries(PARTICIPANT_ROLE_TO_DB).map(([api, db]) => [db, api])
);

const MESSAGE_TYPE_TO_DB = {
  text: "TEXT",
  code: "CODE",
  system: "SYSTEM",
};

const MESSAGE_TYPE_TO_API = Object.fromEntries(
  Object.entries(MESSAGE_TYPE_TO_DB).map(([api, db]) => [db, api])
);

const ACTIVITY_EVENT_TO_DB = {
  joined: "JOINED",
  left: "LEFT",
  "code-executed": "CODE_EXECUTED",
  "code-shared": "CODE_SHARED",
  "screen-shared": "SCREEN_SHARED",
  "camera-toggled": "CAMERA_TOGGLED",
  "mic-toggled": "MIC_TOGGLED",
  "message-sent": "MESSAGE_SENT",
  "role-changed": "ROLE_CHANGED",
  "permissions-changed": "PERMISSIONS_CHANGED",
};

const ACTIVITY_EVENT_TO_API = Object.fromEntries(
  Object.entries(ACTIVITY_EVENT_TO_DB).map(([api, db]) => [db, api])
);

const DEFAULT_ROOM_CONFIG = {
  recordingEnabled: true,
  chatEnabled: true,
  screenShareEnabled: true,
  codeEditorEnabled: true,
  whiteboardEnabled: false,
  maxParticipants: 6,
  allowMembershipChangeOnJoin: false,
};

const DEFAULT_PARTICIPANT_PERMISSIONS = {
  canEdit: true,
  canExecute: true,
  canScreenShare: true,
  canChat: true,
  canMute: true,
};

export function normalizeRole(role) {
  return ROLE_TO_DB[String(role || "candidate").toLowerCase()] || "CANDIDATE";
}

export function toApiRole(role) {
  return ROLE_TO_API[String(role || "CANDIDATE").toUpperCase()] || "candidate";
}

export function normalizeRoomType(roomType) {
  const value = String(roomType || "general").toLowerCase();
  return ROOM_TYPE_TO_DB[value] || "GENERAL";
}

export function toApiRoomType(roomType) {
  return ROOM_TYPE_TO_API[String(roomType || "GENERAL").toUpperCase()] || "general";
}

export function normalizeParticipantRole(role) {
  return PARTICIPANT_ROLE_TO_DB[String(role || "viewer").toLowerCase()] || "VIEWER";
}

export function toApiParticipantRole(role) {
  return PARTICIPANT_ROLE_TO_API[String(role || "VIEWER").toUpperCase()] || "viewer";
}

export function normalizeMessageType(messageType) {
  return MESSAGE_TYPE_TO_DB[String(messageType || "text").toLowerCase()] || "TEXT";
}

export function toApiMessageType(messageType) {
  return MESSAGE_TYPE_TO_API[String(messageType || "TEXT").toUpperCase()] || "text";
}

export function normalizeActivityEventType(eventType) {
  return ACTIVITY_EVENT_TO_DB[String(eventType || "joined").toLowerCase()] || "JOINED";
}

export function toApiActivityEventType(eventType) {
  return ACTIVITY_EVENT_TO_API[String(eventType || "JOINED").toUpperCase()] || "joined";
}

export function buildRoomConfig(config = {}) {
  return {
    ...DEFAULT_ROOM_CONFIG,
    ...(config && typeof config === "object" ? config : {}),
  };
}

export function buildParticipantPermissions(permissions = {}) {
  return {
    ...DEFAULT_PARTICIPANT_PERMISSIONS,
    ...(permissions && typeof permissions === "object" ? permissions : {}),
  };
}

export async function ensurePrismaUser(sourceUser) {
  const clerkId = sourceUser?.clerkId;
  if (!clerkId) {
    throw new Error("Missing Clerk user id");
  }

  const email =
    sourceUser?.email ||
    sourceUser?.primaryEmailAddress?.emailAddress ||
    sourceUser?.emailAddresses?.[0]?.emailAddress ||
    `${clerkId}@clerk.local`;

  const name =
    sourceUser?.name ||
    sourceUser?.fullName ||
    [sourceUser?.firstName, sourceUser?.lastName].filter(Boolean).join(" ").trim() ||
    sourceUser?.firstName ||
    sourceUser?.lastName ||
    clerkId.slice(0, 8) ||
    "User";

  const profileImage = sourceUser?.profileImage || sourceUser?.imageUrl || sourceUser?.image || "";

  return prisma.user.upsert({
    where: { clerkId },
    update: {
      name,
      email,
      profileImage,
    },
    create: {
      clerkId,
      name,
      email,
      profileImage,
      role: normalizeRole(sourceUser?.role),
    },
  });
}

export function mapPrismaUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage || "",
    role: toApiRole(user.role),
    skills: user.skills || [],
    yearsOfExperience: user.yearsOfExperience || 0,
  };
}

export function mapParticipant(participant) {
  if (!participant) return null;

  return {
    id: participant.id,
    userId: participant.user ? mapPrismaUser(participant.user) : participant.userId,
    role: toApiParticipantRole(participant.role),
    joinedAt: participant.joinedAt,
    permissions: buildParticipantPermissions(participant.permissions),
    isMuted: participant.isMuted,
    isCameraOff: participant.isCameraOff,
    isScreenSharing: participant.isScreenSharing,
  };
}

export async function populateLastEditedBy(sharedCode) {
  if (!sharedCode || !sharedCode.lastEditedBy) return sharedCode || null;

  const editorId = sharedCode.lastEditedBy;
  const editor = await prisma.user.findFirst({
    where: {
      OR: [{ id: editorId }, { clerkId: editorId }],
    },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      profileImage: true,
    },
  });

  return {
    ...sharedCode,
    lastEditedBy: editor ? mapPrismaUser(editor) : editorId,
  };
}

export async function mapRoom(room, { populateEditor = false } = {}) {
  if (!room) return null;

  const creator = room.creator ? mapPrismaUser(room.creator) : null;
  const participants = (room.participants || []).map(mapParticipant);
  const sharedCode = populateEditor
    ? await populateLastEditedBy(room.sharedCode)
    : room.sharedCode || null;

  return {
    id: room.id,
    name: room.name,
    description: room.description || "",
    creator,
    roomType: toApiRoomType(room.roomType),
    isPublic: room.isPublic,
    password: room.password,
    participants,
    config: room.config || buildRoomConfig(),
    sharedCode: sharedCode || { language: "javascript", code: "", lastEditedBy: null, lastEditedAt: null },
    status: String(room.status || "ACTIVE").toLowerCase(),
    tags: room.tags || [],
    recordingUrl: room.recordingUrl,
    recordingActive: room.recordingActive,
    recordingStartedAt: room.recordingStartedAt,
    expiresAt: room.expiresAt,
    participantCount: participants.length,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

export async function mapChatMessage(message) {
  if (!message) return null;

  const sender = message.sender ? mapPrismaUser(message.sender) : null;
  const mentionedUsers = Array.isArray(message.mentionedUsers)
    ? message.mentionedUsers
    : [];

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
    mentionedUsers,
    createdAt: message.createdAt,
  };
}

export async function mapActivity(activity) {
  if (!activity) return null;

  return {
    id: activity.id,
    roomId: activity.roomId,
    userId: activity.user ? mapPrismaUser(activity.user) : activity.userId,
    userName: activity.userName,
    eventType: toApiActivityEventType(activity.eventType),
    description: activity.description || "",
    metadata: activity.metadata || null,
    ipAddress: activity.ipAddress || "",
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };
}

export async function resolveUserId(identifier) {
  if (!identifier) return null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: identifier }, { clerkId: identifier }],
    },
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

  return user;
}
