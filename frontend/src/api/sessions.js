import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/api/sessions", data, {
      skipErrorToast: true, // Let the mutation handle error display
      timeout: 20000, // Increase timeout for Stream provisioning
    });
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/api/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/api/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/api/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/api/sessions/${id}/join`);
    return response.data;
  },
  endSession: async (id) => {
    const response = await axiosInstance.post(`/api/sessions/${id}/end`);
    return response.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get("/api/chat/token");
    return response.data;
  },
};
