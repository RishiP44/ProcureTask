import express from 'express';
import { getNotifications, createNotification } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications)
    .post(protect, createNotification);

export default router;
