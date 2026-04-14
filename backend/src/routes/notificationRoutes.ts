import express from 'express';
import { getMyNotifications, markRead, markAllRead } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);

export default router;
