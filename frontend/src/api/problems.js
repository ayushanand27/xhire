import axios from "../lib/axios";

export const problemsApi = {
  list: (params = {}) => axios.get("/api/problems", { params }),
  getById: (id) => axios.get(`/api/problems/${id}`),
  getByTitle: (title) => axios.get(`/api/problems`, { params: { title } }),
};
