import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { startRecording, stopRecording } from "../controllers/recordingController.js";

// mergeParams to access :roomId from parent mount path
const router = express.Router({ mergeParams: true });

router.post("/start", protectRoute, startRecording);
router.post("/stop", protectRoute, stopRecording);

export default router;
