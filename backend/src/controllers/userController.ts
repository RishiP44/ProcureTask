import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get all users (for assignment selection)
// @route   GET /api/users
// @access  Private (Admin/HR)
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).select('-passwordHash').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
