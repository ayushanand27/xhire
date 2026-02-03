import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getAllProblems, getProblemById } from "../controllers/problemsController.js";

const router = express.Router();

// Problems routes - authenticated users can access
router.get("/", protectRoute, getAllProblems);
router.get("/:id", protectRoute, getProblemById);

export default router;
