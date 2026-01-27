import express from "express";
import { handleStreamWebhook } from "../controllers/streamWebhookController.js";

const router = express.Router();

// Stream will POST events here
router.post("/", express.json({ type: "application/json" }), handleStreamWebhook);

export default router;
