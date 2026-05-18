import axiosInstance from "../lib/axios";

/**
 * Interview API Client (Prisma/PostgreSQL Version)
 * Uses the new /api/interview endpoints with Groq, Deepgram STT, and PostgreSQL storage
 */
export const interviewApiV2 = {
  /**
   * Create a new interview session
   * - Uploads resume and JD
  * - Parses resume with Groq
   * - Returns sessionId for starting the interview
   */
  createInterview: async ({ type, resumeText, jdText }) => {
    const response = await axiosInstance.post("/api/interview", {
      type,
      resumeText,
      jdText,
    });
    return response.data;
  },

  /**
   * List all interviews for current user (candidate or recruiter)
   */
  listMyInterviews: async (params = {}) => {
    const response = await axiosInstance.get("/api/interview/my", { params });
    return response.data;
  },

  /**
   * Fetch the authenticated user's interview sessions for the candidate dashboard
   */
  listSessions: async (params = {}) => {
    const response = await axiosInstance.get("/api/interview/sessions", { params });
    return response.data;
  },

  /**
   * Get full interview details including transcript and evaluation
   */
  getInterviewById: async (id) => {
    const response = await axiosInstance.get(`/api/interview/${id}`);
    return response.data;
  },

  /**
   * Start an interview session
   * - Changes status from PENDING to ACTIVE
  * - Generates first 3 questions using Groq
   * - Returns questions array
   */
  startInterview: async (id) => {
    const response = await axiosInstance.post(`/api/interview/${id}/start`);
    return response.data;
  },

  /**
   * Submit an answer to a question
   * - Stores answer as Message
  * - Groq evaluates answer and gives feedback
   * - Returns evaluation and next question
   */
  submitAnswer: async (id, { question, answer }) => {
    const response = await axiosInstance.post(`/api/interview/${id}/answer`, {
      question,
      answer,
    });
    return response.data;
  },

  /**
   * Log a proctoring event (e.g., no face detected, gaze off-screen)
   * - Increments warning count
   * - Auto-rejects interview on 3 warnings
   */
  logProctorEvent: async (id, { eventType, severity }) => {
    const response = await axiosInstance.post(`/api/interview/${id}/proctor/event`, {
      eventType,
      severity,
    });
    return response.data;
  },

  /**
   * Complete the interview session
   * - Marks status as COMPLETED
   * - Enqueues async evaluation job
   * - Returns evaluation job ID for polling
   */
  completeInterview: async (id) => {
    const response = await axiosInstance.post(`/api/interview/${id}/complete`);
    return response.data;
  },

  /**
   * Get Deepgram STT WebSocket connection URL
   * This is called to get the connection string for browser WebSocket
   */
  getDeepgramConnectionUrl: async () => {
    // Returns a URL like: wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&...
    const response = await axiosInstance.get("/api/interview/deepgram/connection-url");
    return response.data.url;
  },

  /**
   * Poll job status for async evaluation
   * Checks if evaluation job has completed
   */
  getJobStatus: async (jobId) => {
    const response = await axiosInstance.get(`/api/jobs/${jobId}`);
    return response.data;
  },
};

export default interviewApiV2;
