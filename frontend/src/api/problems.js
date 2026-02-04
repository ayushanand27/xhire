import axios from "../lib/axios";

export const problemsApi = {
  list: async (params = {}) => {
    try {
      const response = await axios.get("/api/problems", { params });
      console.log("Problems list response:", response.data);
      return response;
    } catch (error) {
      console.error("Problems list error:", error.response?.data || error.message);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await axios.get(`/api/problems/${id}`);
      return response;
    } catch (error) {
      console.error("Get problem error:", error.response?.data || error.message);
      throw error;
    }
  },
  getByTitle: async (title) => {
    try {
      const response = await axios.get(`/api/problems`, { params: { title } });
      return response;
    } catch (error) {
      console.error("Get by title error:", error.response?.data || error.message);
      throw error;
    }
  },
};
