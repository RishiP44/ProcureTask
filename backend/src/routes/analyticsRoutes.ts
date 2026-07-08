import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Only Admin and HR are authorized to fetch dashboard analytics
router.route('/')
    .get(protect, authorize('Admin', 'HR'), getDashboardAnalytics);

export default router;
