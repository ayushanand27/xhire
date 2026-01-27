import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { generateTests, runTests } from "../controllers/testController.js";

const router = express.Router();

router.use(protectRoute);

router.post("/generate", generateTests);
router.post("/run", runTests);

export default router;

