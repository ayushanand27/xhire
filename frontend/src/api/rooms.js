import axios from "../lib/axios.js";

// ============= ROOM APIs =============

export const roomAPI = {
  createRoom: (roomData) => axios.post("/api/rooms", roomData),
  getAllRooms: (filters = {}) => axios.get("/api/rooms", { params: filters }),
  getRoom: (roomId) => axios.get(`/api/rooms/${roomId}`),
  updateRoom: (roomId, roomData) => axios.put(`/api/rooms/${roomId}`, roomData),
  deleteRoom: (roomId) => axios.delete(`/api/rooms/${roomId}`),
  joinRoom: (roomId) => axios.post(`/api/rooms/${roomId}/join`),
  leaveRoom: (roomId) => axios.post(`/api/rooms/${roomId}/leave`),
  inviteToRoom: (roomId, payload) => axios.post(`/api/rooms/${roomId}/invite`, payload),
  getStreamToken: (roomId) => axios.get(`/api/rooms/${roomId}/stream-token`),
  executeCode: (roomId, codeData) =>
    axios.post(`/api/rooms/${roomId}/execute-code`, codeData),
  startRecording: (roomId, payload = {}) =>
    axios.post(`/api/rooms/${roomId}/recordings/start`, payload),
  stopRecording: (roomId, payload = {}) =>
    axios.post(`/api/rooms/${roomId}/recordings/stop`, payload),
};

// ============= PARTICIPANT APIs =============

export const participantAPI = {
  getParticipants: (roomId) =>
    axios.get(`/api/rooms/${roomId}/participants`),
  getParticipantDetails: (roomId, participantId) =>
    axios.get(`/api/rooms/${roomId}/participants/${participantId}`),
  updateParticipantRole: (roomId, participantId, role) =>
    axios.put(`/api/rooms/${roomId}/participants/${participantId}/role`, { role }),
  updateParticipantPermissions: (roomId, participantId, permissions) =>
    axios.put(
      `/api/rooms/${roomId}/participants/${participantId}/permissions`,
      permissions
    ),
  removeParticipant: (roomId, participantId) =>
    axios.delete(`/api/rooms/${roomId}/participants/${participantId}`),
  updateMediaStatus: (roomId, participantId, mediaStatus) =>
    axios.put(
      `/api/rooms/${roomId}/participants/${participantId}/media-status`,
      mediaStatus
    ),
};

// ============= CHAT APIs =============

export const chatAPI = {
  getChatHistory: (roomId, page = 1, limit = 50) =>
    axios.get(`/api/rooms/${roomId}/chat/history`, { params: { page, limit } }),
  searchMessages: (roomId, query) =>
    axios.get(`/api/rooms/${roomId}/chat/search`, { params: { query } }),
  sendMessage: (roomId, messageData) =>
    axios.post(`/api/rooms/${roomId}/chat`, messageData),
  editMessage: (roomId, messageId, message) =>
    axios.put(`/api/rooms/${roomId}/chat/${messageId}`, { message }),
  deleteMessage: (roomId, messageId) =>
    axios.delete(`/api/rooms/${roomId}/chat/${messageId}`),
  addReaction: (roomId, messageId, emoji) =>
    axios.post(`/api/rooms/${roomId}/chat/${messageId}/reactions`, { emoji }),
  getStreamToken: () => axios.get("/api/chat/token"),
};

// ============= ACTIVITY APIs =============

export const activityAPI = {
  getRoomActivity: (roomId, page = 1, limit = 50, eventType = null) =>
    axios.get(`/api/rooms/${roomId}/activity`, {
      params: { page, limit, eventType },
    }),
  getActivityByType: (roomId, eventType, page = 1, limit = 50) =>
    axios.get(`/api/rooms/${roomId}/activity/type/${eventType}`, {
      params: { page, limit },
    }),
  getRoomStats: (roomId) =>
    axios.get(`/api/rooms/${roomId}/activity/stats`),
  getUserActivity: (roomId, userId, page = 1, limit = 50) =>
    axios.get(`/api/rooms/${roomId}/activity/user/${userId}`, {
      params: { page, limit },
    }),
};

// ============= USER PREFERENCE APIs =============

export const userAPI = {
  getMe: () => axios.get("/api/user/me"),
  getPreferences: () => axios.get("/api/user/preferences"),
  updatePreferences: (preferencesData) =>
    axios.put("/api/user/preferences", preferencesData),
  getFavoriteRooms: () => axios.get("/api/user/favorites"),
  addFavoriteRoom: (roomId) =>
    axios.post("/api/user/favorites", { roomId }),
  removeFavoriteRoom: (roomId) =>
    axios.delete(`/api/user/favorites/${roomId}`),
  getBlockedUsers: () => axios.get("/api/user/blocked"),
  blockUser: (userId) => axios.post("/api/user/blocked", { userId }),
  unblockUser: (userId) => axios.delete(`/api/user/blocked/${userId}`),
};

// ============= CODE EXECUTION =============

export const codeAPI = {
  executeCode: (roomId, code, language) =>
    axios.post(`/api/rooms/${roomId}/execute-code`, { code, language }),
};
