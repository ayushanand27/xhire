import axiosInstance from "../lib/axios";

export const interviewApi = {
  createInterview: async (data) => {
    const response = await axiosInstance.post("/api/interviews", data);
    return response.data;
  },

  listMyInterviews: async (params = {}) => {
    const response = await axiosInstance.get("/api/interviews/my", { params });
    return response.data;
  },

  getInterviewById: async (id) => {
    const response = await axiosInstance.get(`/api/interviews/${id}`);
    return response.data;
  },

  startInterview: async (id, data) => {
    const response = await axiosInstance.post(`/api/interviews/${id}/start`, data);
    return response.data;
  },

  submitAnswer: async (id, data) => {
    const response = await axiosInstance.post(`/api/interviews/${id}/answer`, data);
    return response.data;
  },

  logProctorEvent: async (id, data) => {
    const response = await axiosInstance.post(`/api/interviews/${id}/proctor/event`, data);
    return response.data;
  },

  completeInterview: async (id) => {
    const response = await axiosInstance.post(`/api/interviews/${id}/complete`);
    return response.data;
  },

  recruiterDashboard: async () => {
    const response = await axiosInstance.get("/api/interviews/recruiter/dashboard");
    return response.data;
  },
};
