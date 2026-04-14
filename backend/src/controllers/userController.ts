import { Request, Response } from 'express';
import User from '../models/User';

// @desc Get all users (for assignment / HR directory)
export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role, department, status } = req.query;
        const filter: any = {};
        if (role) filter.role = role;
        if (department) filter.department = department;
        if (status) filter.status = status;

        const users = await User.find(filter).select('-passwordHash').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Update user profile
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { name, department, position, phone, startDate, role, status, avatar } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, department, position, phone, startDate, role, status, avatar },
            { new: true, runValidators: true }
        ).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Delete user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Get HR stats
export const getHRStats = async (req: Request, res: Response) => {
    try {
        const total = await User.countDocuments({ role: { $in: ['Employee', 'Vendor'] } });
        const active = await User.countDocuments({ status: 'Active' });
        const invited = await User.countDocuments({ status: 'Invited' });
        const pending = await User.countDocuments({ status: 'Pending' });

        const byDepartment = await User.aggregate([
            { $match: { role: 'Employee' } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({ total, active, invited, pending, byDepartment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
