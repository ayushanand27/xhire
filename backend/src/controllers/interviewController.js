import { Interview } from "../models/Interview.js";

const toRange = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const inferSkills = (resumeText = "", jdText = "") => {
  const catalog = [
    "javascript",
    "typescript",
    "react",
    "node",
    "express",
    "python",
    "java",
    "sql",
    "postgresql",
    "mongodb",
    "aws",
    "docker",
    "kubernetes",
    "system design",
  ];

  const bag = `${resumeText} ${jdText}`.toLowerCase();
  return catalog.filter((s) => bag.includes(s));
};

const calculateResumeJdMatch = (resumeText = "", jdText = "") => {
  if (!resumeText || !jdText) return null;
  const resumeTokens = new Set(resumeText.toLowerCase().split(/\W+/).filter(Boolean));
  const jdTokens = new Set(jdText.toLowerCase().split(/\W+/).filter(Boolean));
  if (!resumeTokens.size || !jdTokens.size) return null;

  let overlap = 0;
  for (const token of jdTokens) {
    if (resumeTokens.has(token)) overlap += 1;
  }
  return toRange(Math.round((overlap / jdTokens.size) * 100));
};

const buildNextQuestion = (interview) => {
  const transcriptLen = interview.transcript.length;
  const skills = interview.extractedSkills.length
    ? interview.extractedSkills
    : ["problem solving", "communication"];

  if (transcriptLen === 0) {
    return `Tell me about yourself and why you're a strong fit for this role, especially around ${
      skills[0]
    }.`;
  }

  if (transcriptLen < 3) {
    return `Can you describe a real project where you used ${skills[transcriptLen % skills.length]} and what trade-offs you made?`;
  }

  if (transcriptLen < 6) {
    return "Walk me through how you would debug a production issue where latency suddenly increases by 3x.";
  }

  return "What is one thing you would improve in your previous answer, and why?";
};

export const createInterview = async (req, res) => {
  try {
    const { type, title, candidateId, resumeText = "", jobDescriptionText = "" } = req.body;

    if (!["mock", "proctored"].includes(type)) {
      return res.status(400).json({ message: "type must be either mock or proctored" });
    }

    if (type === "mock") {
      const interview = await Interview.create({
        type,
        title: title?.trim() || "Mock Interview",
        candidate: req.user._id,
        resumeText,
        jobDescriptionText,
        extractedSkills: inferSkills(resumeText, jobDescriptionText),
        resumeJdMatchScore: calculateResumeJdMatch(resumeText, jobDescriptionText),
      });

      return res.status(201).json({ interview });
    }

    // proctored interview (recruiter-led)
    if (req.user.role !== "recruiter" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only recruiters can create proctored interviews" });
    }

    if (!candidateId) {
      return res.status(400).json({ message: "candidateId is required for proctored interviews" });
    }

    const interview = await Interview.create({
      type,
      title: title?.trim() || "Proctored Interview",
      candidate: candidateId,
      recruiter: req.user._id,
      resumeText,
      jobDescriptionText,
      extractedSkills: inferSkills(resumeText, jobDescriptionText),
      resumeJdMatchScore: calculateResumeJdMatch(resumeText, jobDescriptionText),
    });

    return res.status(201).json({ interview });
  } catch (error) {
    console.error("Error creating interview:", error);
    return res.status(500).json({ message: "Failed to create interview" });
  }
};

export const listMyInterviews = async (req, res) => {
  try {
    const { status, type } = req.query;

    const filter = {
      $or: [{ candidate: req.user._id }, { recruiter: req.user._id }],
    };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const interviews = await Interview.find(filter)
      .populate("candidate", "name email role profileImage")
      .populate("recruiter", "name email role profileImage")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ interviews });
  } catch (error) {
    console.error("Error listing interviews:", error);
    return res.status(500).json({ message: "Failed to list interviews" });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidate", "name email role profileImage")
      .populate("recruiter", "name email role profileImage");

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const canAccess =
      interview.candidate?._id.toString() === req.user._id.toString() ||
      interview.recruiter?._id?.toString() === req.user._id.toString() ||
      req.user.role === "admin";

    if (!canAccess) return res.status(403).json({ message: "Forbidden" });

    return res.json({ interview });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return res.status(500).json({ message: "Failed to fetch interview" });
  }
};

export const startInterview = async (req, res) => {
  try {
    const { webcamEnabled, screenShareEnabled, faceVisible } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const isCandidate = interview.candidate.toString() === req.user._id.toString();
    const isRecruiter = interview.recruiter?.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (interview.type === "proctored") {
      if (!webcamEnabled || !screenShareEnabled || !faceVisible) {
        return res.status(400).json({
          message:
            "Proctored interview cannot start until webcam, screen share, and face visibility checks pass",
        });
      }
    }

    interview.proctoring.webcamEnabled = !!webcamEnabled;
    interview.proctoring.screenShareEnabled = !!screenShareEnabled;
    interview.proctoring.faceVisible = !!faceVisible;
    interview.status = "in_progress";
    interview.startedAt = new Date();

    if (!interview.lastQuestion) {
      interview.lastQuestion = buildNextQuestion(interview);
      interview.transcript.push({ question: interview.lastQuestion, askedAt: new Date() });
    }

    await interview.save();
    return res.json({ interview });
  } catch (error) {
    console.error("Error starting interview:", error);
    return res.status(500).json({ message: "Failed to start interview" });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { answerText, answerSource = "text" } = req.body;
    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ message: "answerText is required" });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only candidate can submit answers" });
    }

    if (interview.status !== "in_progress") {
      return res.status(400).json({ message: "Interview is not in progress" });
    }

    if (!interview.transcript.length) {
      const firstQuestion = buildNextQuestion(interview);
      interview.transcript.push({ question: firstQuestion, askedAt: new Date() });
      interview.lastQuestion = firstQuestion;
    }

    const lastTurn = interview.transcript[interview.transcript.length - 1];
    lastTurn.answerText = answerText.trim();
    lastTurn.answerSource = answerSource;
    lastTurn.answeredAt = new Date();

    const nextQuestion = buildNextQuestion(interview);
    interview.lastQuestion = nextQuestion;
    interview.transcript.push({ question: nextQuestion, askedAt: new Date() });

    await interview.save();
    return res.json({ interview, nextQuestion });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({ message: "Failed to submit answer" });
  }
};

export const logProctorEvent = async (req, res) => {
  try {
    const { type, severity = "medium", note = "" } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const isRecruiter = interview.recruiter?.toString() === req.user._id.toString();
    const isCandidate = interview.candidate.toString() === req.user._id.toString();
    if (!isRecruiter && !isCandidate && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    interview.proctoring.events.push({ type, severity, note, timestamp: new Date() });

    interview.proctoring.warningsCount = Math.min(interview.proctoring.warningsCount + 1, 3);
    if (interview.proctoring.warningsCount === 1) interview.proctoring.warningLevel = "warning_1";
    if (interview.proctoring.warningsCount === 2) interview.proctoring.warningLevel = "warning_2";
    if (interview.proctoring.warningsCount >= 3) {
      interview.proctoring.warningLevel = "warning_3";
      interview.status = "rejected";
      interview.endedAt = new Date();
    }

    await interview.save();

    return res.json({
      warningsCount: interview.proctoring.warningsCount,
      warningLevel: interview.proctoring.warningLevel,
      status: interview.status,
    });
  } catch (error) {
    console.error("Error logging proctor event:", error);
    return res.status(500).json({ message: "Failed to log proctor event" });
  }
};

export const completeInterviewAndEvaluate = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const isCandidate = interview.candidate.toString() === req.user._id.toString();
    const isRecruiter = interview.recruiter?.toString() === req.user._id.toString();
    if (!isCandidate && !isRecruiter && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const answered = interview.transcript.filter((t) => t.answerText?.trim());
    const avgLength = answered.length
      ? Math.round(answered.reduce((acc, t) => acc + t.answerText.length, 0) / answered.length)
      : 0;

    const technical = toRange(45 + Math.min(answered.length * 8, 35));
    const communication = toRange(40 + Math.min(Math.floor(avgLength / 10), 40));
    const confidence = toRange(70 - interview.proctoring.warningsCount * 20 + Math.min(answered.length * 3, 15));
    const behavioral = toRange(Math.round((communication + confidence) / 2));
    const overall = toRange(Math.round((technical + communication + confidence + behavioral) / 4));

    interview.evaluation.scores = {
      technical,
      communication,
      confidence,
      behavioral,
      overall,
    };

    interview.evaluation.strengths = [
      technical >= 70 ? "Good technical depth" : "Shows baseline technical understanding",
      communication >= 70 ? "Clear communication" : "Can improve communication structure",
    ];

    interview.evaluation.weaknesses = [
      confidence < 60 ? "Confidence fluctuated under pressure" : "Limited use of concrete examples",
      technical < 65 ? "Needs stronger problem decomposition" : "Can improve edge-case articulation",
    ];

    interview.evaluation.improvementSuggestions = [
      "Use STAR format for behavioral answers.",
      "Explain trade-offs explicitly for each technical decision.",
      "Practice concise summaries after each answer.",
    ];

    interview.evaluation.behavioralInsights = [
      `Warnings observed: ${interview.proctoring.warningsCount}`,
      interview.proctoring.warningsCount > 0
        ? "Attention stability should be improved."
        : "Good focus and compliance during interview.",
    ];

    interview.evaluation.antiBiasNotes =
      "Structured rubric used (technical, communication, confidence, behavioral). Human review recommended before final hiring decision.";
    interview.evaluation.generatedAt = new Date();

    if (interview.status === "in_progress" || interview.status === "scheduled") {
      interview.status = "completed";
    }
    if (!interview.endedAt) interview.endedAt = new Date();

    await interview.save();

    return res.json({
      interviewId: interview._id,
      status: interview.status,
      evaluation: interview.evaluation,
    });
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return res.status(500).json({ message: "Failed to evaluate interview" });
  }
};

export const recruiterDashboard = async (req, res) => {
  try {
    if (req.user.role !== "recruiter" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Recruiter role required" });
    }

    const interviews = await Interview.find({ recruiter: req.user._id })
      .populate("candidate", "name email profileImage role")
      .sort({ createdAt: -1 })
      .limit(200);

    const summary = {
      total: interviews.length,
      completed: interviews.filter((i) => i.status === "completed").length,
      inProgress: interviews.filter((i) => i.status === "in_progress").length,
      rejected: interviews.filter((i) => i.status === "rejected").length,
      avgOverallScore: 0,
    };

    const scored = interviews
      .map((i) => i.evaluation?.scores?.overall)
      .filter((v) => typeof v === "number");

    if (scored.length) {
      summary.avgOverallScore = Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
    }

    return res.json({ summary, interviews });
  } catch (error) {
    console.error("Error in recruiter dashboard:", error);
    return res.status(500).json({ message: "Failed to load recruiter dashboard" });
  }
};
