import { prisma } from "../lib/prisma.js";

/**
 * Get current user profile
 * GET /api/user/me
 */
export async function getMe(req, res) {
  try {
    const { userId } = req.auth;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: {
          select: { id: true, filename: true, skills: true, createdAt: true },
        },
        jobDescriptions: {
          select: { id: true, title: true, company: true, createdAt: true },
        },
        _count: {
          select: {
            candidateSessions: true,
            recruiterSessions: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update user profile
 * PUT /api/user/me
 */
export async function updateMe(req, res) {
  try {
    const { userId } = req.auth;
    const { name, role, skills, yearsOfExperience } = req.body;

    // Validate role if provided
    if (role && !["CANDIDATE", "RECRUITER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        // Additional fields can be stored in a profile extension table if needed
      },
    });

    return res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get candidate directory for recruiters
 * GET /api/user/directory
 */
export async function getDirectory(req, res) {
  try {
    const { userId } = req.auth;

    // Verify user is recruiter
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.role !== "RECRUITER") {
      return res.status(403).json({ error: "Only recruiters can view directory" });
    }

    // Get all candidates with their latest session stats
    const candidates = await prisma.user.findMany({
      where: {
        role: "CANDIDATE",
      },
      include: {
        candidateSessions: {
          where: {
            status: "COMPLETED",
          },
          include: {
            evaluation: {
              select: {
                technicalScore: true,
                communicationScore: true,
                overall: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        resumes: {
          select: { id: true, skills: true },
          take: 1,
        },
        _count: {
          select: {
            candidateSessions: true,
          },
        },
      },
    });

    return res.status(200).json(candidates);
  } catch (error) {
    console.error("Error getting directory:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Recruiter dashboard stats
 * GET /api/recruiter/dashboard
 */
export async function recruiterDashboard(req, res) {
  try {
    const { userId } = req.auth;

    // Verify user is recruiter
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.role !== "RECRUITER") {
      return res
        .status(403)
        .json({ error: "Only recruiters can view dashboard" });
    }

    // Get sessions stats
    const totalSessions = await prisma.session.count({
      where: { recruiterId: userId },
    });

    const completedSessions = await prisma.session.count({
      where: {
        recruiterId: userId,
        status: "COMPLETED",
      },
    });

    const activeSessions = await prisma.session.count({
      where: {
        recruiterId: userId,
        status: "ACTIVE",
      },
    });

    const terminatedSessions = await prisma.session.count({
      where: {
        recruiterId: userId,
        status: "TERMINATED",
      },
    });

    // Get average scores
    const evaluations = await prisma.evaluation.findMany({
      where: {
        session: {
          recruiterId: userId,
        },
      },
      select: {
        technicalScore: true,
        communicationScore: true,
        confidenceScore: true,
        behavioralScore: true,
      },
    });

    const avgTechnical =
      evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + (e.technicalScore || 0), 0) /
          evaluations.length
        : 0;

    const avgCommunication =
      evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + (e.communicationScore || 0), 0) /
          evaluations.length
        : 0;

    // Get recent sessions
    const recentSessions = await prisma.session.findMany({
      where: { recruiterId: userId },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        evaluation: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return res.status(200).json({
      stats: {
        totalSessions,
        completedSessions,
        activeSessions,
        terminatedSessions,
        averageScores: {
          technical: Math.round(avgTechnical),
          communication: Math.round(avgCommunication),
        },
      },
      recentSessions,
    });
  } catch (error) {
    console.error("Error getting dashboard:", error);
    return res.status(500).json({ error: error.message });
  }
}

export default {
  getMe,
  updateMe,
  getDirectory,
  recruiterDashboard,
};
