import express from 'express';
import { getDeepgramToken } from '../controllers/deepgramController.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Return an ephemeral Deepgram token for the authenticated user
router.get('/token', protectRoute, getDeepgramToken);

export default router;
