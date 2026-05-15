import axiosInstance from "../lib/axios";

/**
 * User API Client (Prisma/PostgreSQL Version)
 * Uses /api/user/v2 endpoints
 */
export const userApiV2 = {
  /**
   * Get current user profile
   */
  getMe: async () => {
    const response = await axiosInstance.get("/api/user/v2/me");
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateMe: async ({ name, role, skills, yearsOfExperience }) => {
    const response = await axiosInstance.put("/api/user/v2/me", {
      name,
      role,
      skills,
      yearsOfExperience,
    });
    return response.data;
  },

  /**
   * Get directory of all candidates (recruiter only)
   * Returns list of candidates with:
   * - Latest interview performance metrics
   * - Resume skills
   * - Session history
   */
  getDirectory: async () => {
    const response = await axiosInstance.get("/api/user/v2/directory");
    return response.data;
  },

  /**
   * Get recruiter dashboard statistics
   * Returns:
   * - Total, completed, active, terminated sessions
   * - Average technical and communication scores
   * - Recent interviews list
   */
  recruiterDashboard: async () => {
    const response = await axiosInstance.get("/api/user/v2/recruiter/dashboard");
    return response.data;
  },
};

export default userApiV2;
