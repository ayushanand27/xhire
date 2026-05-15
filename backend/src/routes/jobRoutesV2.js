import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getJobStatus,
  getDeepgramConnectionUrl,
} from "../controllers/jobControllerV2.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Get job status
router.get("/:id", getJobStatus);

// Get Deepgram connection URL
router.get("/deepgram/connection-url", getDeepgramConnectionUrl);

export default router;
