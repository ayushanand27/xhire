import { prisma } from "../lib/prisma.js";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  parseResume,
} from "../lib/claude.js";
import { JobQueue } from "../lib/jobQueue.js";

/**
 * Create a new interview session
 * POST /api/interview
 */
export async function createInterview(req, res) {
  try {
    const { userId } = req.auth;
    const { type, resumeText, jdText } = req.body;

    if (!type || !resumeText || !jdText) {
      return res.status(400).json({
        error: "Missing required fields: type, resumeText, jdText",
      });
    }

    if (!["MOCK", "PROCTORED"].includes(type)) {
      return res.status(400).json({ error: "Invalid interview type" });
    }

    // Parse resume with Claude
    const parsedResume = await parseResume(resumeText);

    // Create or get resume record
    const resume = await prisma.resume.create({
      data: {
        userId,
        filename: "uploaded-resume.txt",
        extractedText: resumeText,
        skills: parsedResume.skills || [],
      },
    });

    // Create job description
    const jd = await prisma.jobDescription.create({
      data: {
        userId,
        content: jdText,
        skillsRequired: parsedResume.skills || [],
      },
    });

    // Create session
    const session = await prisma.session.create({
      data: {
        candidateId: userId,
        resumeId: resume.id,
        jdId: jd.id,
        type,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      sessionId: session.id,
      resumeId: resume.id,
      jdId: jd.id,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Start an interview session
 * POST /api/interview/:id/start
 */
export async function startInterview(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.candidateId !== userId && session.recruiterId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (session.status !== "PENDING") {
      return res.status(400).json({ error: "Session already started or ended" });
    }

    // Update session status
    const updated = await prisma.session.update({
      where: { id },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

    // Generate initial questions
    const questions = await generateInterviewQuestions(id, 3);

    return res.status(200).json({
      success: true,
      sessionId: id,
      status: "ACTIVE",
      questions,
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Submit an answer to an interview question
 * POST /api/interview/:id/answer
 */
export async function submitAnswer(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        error: "Missing required fields: question, answer",
      });
    }

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session || session.candidateId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (session.status !== "ACTIVE") {
      return res.status(400).json({ error: "Session not active" });
    }

    // Store the answer as a message
    const message = await prisma.message.create({
      data: {
        sessionId: id,
        role: "CANDIDATE",
        content: answer,
      },
    });

    // Evaluate the answer
    const evaluation = await evaluateAnswer(id, question, answer);

    // Generate AI follow-up question
    const aiMessage = await prisma.message.create({
      data: {
        sessionId: id,
        role: "AI",
        content:
          evaluation.follow_up ||
          "Can you tell me more about your approach?",
      },
    });

    return res.status(200).json({
      success: true,
      evaluation,
      nextQuestion: aiMessage.content,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Log a proctoring event (warning, violation, etc.)
 * POST /api/interview/:id/proctor/event
 */
export async function logProctorEvent(req, res) {
  try {
    const { id } = req.params;
    const { eventType, severity } = req.body;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.type !== "PROCTORED") {
      return res
        .status(400)
        .json({ error: "Proctoring only for PROCTORED interviews" });
    }

    // Create proctor event
    const event = await prisma.proctorEvent.create({
      data: {
        sessionId: id,
        eventType,
        severity: severity || "WARNING",
        warningNum: session.warningCount + 1,
      },
    });

    // Update warning count
    let newWarningCount = session.warningCount + 1;
    let shouldTerminate = false;

    if (newWarningCount >= 3) {
      shouldTerminate = true;
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        warningCount: newWarningCount,
        status: shouldTerminate ? "TERMINATED" : "ACTIVE",
        endedAt: shouldTerminate ? new Date() : null,
      },
    });

    if (shouldTerminate) {
      console.log(`Session ${id} terminated due to 3 warnings`);
    }

    return res.status(200).json({
      success: true,
      warningCount: newWarningCount,
      terminated: shouldTerminate,
    });
  } catch (error) {
    console.error("Error logging proctor event:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Complete interview and trigger evaluation
 * POST /api/interview/:id/complete
 */
export async function completeInterview(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        messages: true,
        proctorEvents: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.candidateId !== userId && session.recruiterId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!["ACTIVE", "TERMINATED"].includes(session.status)) {
      return res.status(400).json({ error: "Session not in correct state" });
    }

    // Mark session as completed
    const updated = await prisma.session.update({
      where: { id },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    });

    // Enqueue evaluation job
    const job = await JobQueue.enqueue("evaluate", { sessionId: id });

    return res.status(200).json({
      success: true,
      sessionId: id,
      status: "COMPLETED",
      evaluationJobId: job.id,
      message: "Interview completed. Evaluation in progress.",
    });
  } catch (error) {
    console.error("Error completing interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get interview details
 * GET /api/interview/:id
 */
export async function getInterview(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        messages: true,
        proctorEvents: true,
        evaluation: true,
        resume: true,
        jd: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (
      session.candidateId !== userId &&
      session.recruiterId !== userId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error getting interview:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * List user's interviews
 * GET /api/interview/my
 */
export async function listMyInterviews(req, res) {
  try {
    const { userId } = req.auth;

    const sessions = await prisma.session.findMany({
      where: {
        OR: [{ candidateId: userId }, { recruiterId: userId }],
      },
      include: {
        messages: true,
        evaluation: true,
        resume: true,
        jd: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Error listing interviews:", error);
    return res.status(500).json({ error: error.message });
  }
}

export default {
  createInterview,
  startInterview,
  submitAnswer,
  logProctorEvent,
  completeInterview,
  getInterview,
  listMyInterviews,
};
