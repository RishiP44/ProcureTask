import { Request, Response } from 'express';
import Notification from '../models/Notification';

// @desc    Get user notifications
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

// @desc    Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        if (notification.user.toString() !== (req as any).user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Mark all as read
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        await Notification.updateMany({ user: (req as any).user.id }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
