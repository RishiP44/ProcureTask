import { Request, Response } from 'express';
import Notification from '../models/Notification';
import AlertLog from '../models/AlertLog';
import { NotificationService } from '../services/notificationService';

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

// @desc    Create a manual notification
// @route   POST /api/notifications
// @access  Private
export const createNotification = async (req: Request, res: Response) => {
    try {
        const newNotification = new Notification({
            ...req.body,
            user: req.body.user || (req as any).user.id
        });
        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: (req as any).user.id },
            { read: true },
            { new: true }
        );

        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notif);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};

// @desc    Mark all notifications of the user as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await Notification.updateMany({ user: userId, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read', error });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const notif = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: (req as any).user.id
        });

        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
};

// @desc    Get all alert logs (auditing)
// @route   GET /api/notifications/logs
// @access  Private (Admin/HR)
export const getAlertLogs = async (req: Request, res: Response) => {
    try {
        const logs = await AlertLog.find()
            .populate('user', 'name email role')
            .populate({
                path: 'assignment',
                populate: { path: 'workflow', select: 'name' }
            })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alert logs', error });
    }
};

// @desc    Manually run the reminder system checks
// @route   POST /api/notifications/run-reminders
// @access  Private (Admin/HR)
export const runReminders = async (req: Request, res: Response) => {
    try {
        const summary = await NotificationService.runReminderCheck();
        res.json({
            message: 'Reminder scan completed successfully',
            summary
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error running reminder scan', error: error.message });
    }
};

// @desc    Trigger a specific test notification scenario for an assignment
// @route   POST /api/notifications/test-scenario
// @access  Private (Admin/HR)
export const triggerTestScenario = async (req: Request, res: Response) => {
    try {
        const { scenarioType, assignmentId } = req.body;
        if (!scenarioType || !assignmentId) {
            return res.status(400).json({ message: 'scenarioType and assignmentId are required' });
        }

        await NotificationService.triggerTestScenario(scenarioType, assignmentId);
        res.json({ message: `Test scenario "${scenarioType}" triggered successfully` });
    } catch (error: any) {
        res.status(500).json({ message: 'Error triggering test scenario', error: error.message });
    }
};
