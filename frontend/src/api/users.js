import axiosInstance from "../lib/axios";

export const userApi = {
  getMe: async () => {
    const response = await axiosInstance.get("/api/user/me");
    return response.data;
  },

  updateMe: async (payload) => {
    const response = await axiosInstance.put("/api/user/me", payload);
    return response.data;
  },

  getDirectory: async (params = {}) => {
    const response = await axiosInstance.get("/api/user/directory", { params });
    return response.data;
  },
};
