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
        const actor = (req as any).user;
        const isManager = ['Admin', 'HR'].includes(actor.role);
        if (actor.id !== req.params.id && !isManager) {
            return res.status(403).json({ message: 'You can only update your own profile' });
        }
        const { name, department, position, phone, startDate, role, status, avatar, companyName, vendorType, taxId, website, address } = req.body;
        const updates: any = { name, phone, avatar };
        const currentUser = await User.findById(req.params.id);
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        if (currentUser.role === 'Vendor') {
            Object.assign(updates, { companyName, vendorType, taxId, website, address });
        } else if (['Employee', 'HR'].includes(currentUser.role)) {
            Object.assign(updates, { department, position, startDate });
        }
        if (isManager) updates.status = status;
        if (actor.role === 'Admin' && role) updates.role = role;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-passwordHash');
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
        const employeeFilter = { role: { $in: ['Employee', 'HR'] } };
        const total = await User.countDocuments(employeeFilter);
        const active = await User.countDocuments({ ...employeeFilter, status: 'Active' });
        const invited = await User.countDocuments({ ...employeeFilter, status: 'Invited' });
        const pending = await User.countDocuments({ ...employeeFilter, status: 'Pending' });
        const vendors = await User.countDocuments({ role: 'Vendor' });
        const activeVendors = await User.countDocuments({ role: 'Vendor', status: 'Active' });

        const byDepartment = await User.aggregate([
            { $match: { role: 'Employee' } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({ total, active, invited, pending, vendors, activeVendors, byDepartment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
