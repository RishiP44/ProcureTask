import express from 'express';
import {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getAlertLogs,
    runReminders,
    triggerTestScenario
} from '../controllers/notificationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications)
    .post(protect, createNotification);

router.put('/read-all', protect, markAllAsRead);

router.route('/:id/read')
    .put(protect, markAsRead);

router.route('/:id')
    .delete(protect, deleteNotification);

// Admin/HR endpoints
router.get('/logs', protect, authorize('Admin', 'HR'), getAlertLogs);
router.post('/run-reminders', protect, authorize('Admin', 'HR'), runReminders);
router.post('/test-scenario', protect, authorize('Admin', 'HR'), triggerTestScenario);

export default router;
