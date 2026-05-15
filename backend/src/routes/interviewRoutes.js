import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  completeInterviewAndEvaluate,
  createInterview,
  getInterviewById,
  listMyInterviews,
  logProctorEvent,
  recruiterDashboard,
  startInterview,
  submitAnswer,
} from "../controllers/interviewController.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createInterview);
router.get("/my", listMyInterviews);
router.get("/recruiter/dashboard", recruiterDashboard);

router.get("/:id", getInterviewById);
router.post("/:id/start", startInterview);
router.post("/:id/answer", submitAnswer);
router.post("/:id/proctor/event", logProctorEvent);
router.post("/:id/complete", completeInterviewAndEvaluate);

export default router;
