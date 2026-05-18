import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createInterview,
  createSession,
  startInterview,
  submitAnswer,
  logProctorEvent,
  completeInterview,
  getInterview,
  listMyInterviews,
  listSessions,
  generateQuestion,
  postMessage,
  evaluateSession,
} from "../controllers/interviewControllerV2.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Create interview
router.post("/", createInterview);

// Candidate dashboard session list
router.get("/sessions", listSessions);

// List user's interviews
router.get("/my", listMyInterviews);

// Get interview details
router.get("/:id", getInterview);

// Start interview
router.post("/:id/start", startInterview);

// Create session from existing resumeId/jdId
router.post('/session', createSession);

// Evaluate session (generate evaluation report and persist)
router.post('/evaluate', evaluateSession);

// Generate a question from resume + JD + conversation
router.post("/question", generateQuestion);

// Accept final transcript/message from client
router.post('/message', postMessage);

// Submit answer
router.post("/:id/answer", submitAnswer);

// Log proctoring event
router.post("/:id/proctor/event", logProctorEvent);

// Complete interview
router.post("/:id/complete", completeInterview);

export default router;
