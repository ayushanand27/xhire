import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { parseMultipartForm } from "../middleware/parseMultipartForm.js";
import { uploadResume } from "../controllers/resumeController.js";

const router = Router();

router.post("/upload", protectRoute, parseMultipartForm, uploadResume);

export default router;