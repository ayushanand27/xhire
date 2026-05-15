import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createInterview,
  startInterview,
  submitAnswer,
  logProctorEvent,
  completeInterview,
  getInterview,
  listMyInterviews,
} from "../controllers/interviewControllerV2.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Create interview
router.post("/", createInterview);

// List user's interviews
router.get("/my", listMyInterviews);

// Get interview details
router.get("/:id", getInterview);

// Start interview
router.post("/:id/start", startInterview);

// Submit answer
router.post("/:id/answer", submitAnswer);

// Log proctoring event
router.post("/:id/proctor/event", logProctorEvent);

// Complete interview
router.post("/:id/complete", completeInterview);

export default router;
