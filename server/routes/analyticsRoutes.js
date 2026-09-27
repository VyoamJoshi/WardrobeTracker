import express from 'express';
import { getAnalyticsData } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getAnalyticsData);

export default router;
