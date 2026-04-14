import { Request, Response } from 'express';
import Notification from '../models/Notification';

// @desc Get notifications for logged-in user
export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find({ user: (req as any).user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Mark notification as read
export const markRead = async (req: Request, res: Response) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Mark all notifications as read
export const markAllRead = async (req: Request, res: Response) => {
    try {
        await Notification.updateMany({ user: (req as any).user.id, read: false }, { read: true });
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
