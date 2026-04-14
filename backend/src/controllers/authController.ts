import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendInviteEmail } from '../services/emailService';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc Register new user
export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role, inviteToken } = req.body;

    try {
        // Check if registering via invite token
        if (inviteToken) {
            const invitedUser = await User.findOne({ inviteToken, status: 'Invited' });
            if (!invitedUser) {
                return res.status(400).json({ message: 'Invalid or expired invite link' });
            }
            if (invitedUser.inviteTokenExpiry && invitedUser.inviteTokenExpiry < new Date()) {
                return res.status(400).json({ message: 'Invite link has expired' });
            }
            // Complete the invited user's registration
            const salt = await bcrypt.genSalt(10);
            invitedUser.name = name || invitedUser.name;
            invitedUser.passwordHash = await bcrypt.hash(password, salt);
            invitedUser.status = 'Active';
            invitedUser.inviteToken = undefined;
            invitedUser.inviteTokenExpiry = undefined;
            await invitedUser.save();

            return res.status(201).json({
                _id: invitedUser.id,
                name: invitedUser.name,
                email: invitedUser.email,
                role: invitedUser.role,
                token: generateToken(invitedUser.id, invitedUser.role),
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: role || 'Employee',
            status: 'Active',
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Login user
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                position: user.position,
                avatar: user.avatar,
                status: user.status,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Invite a user by email (HR/Admin only)
export const inviteUser = async (req: Request, res: Response) => {
    const { name, email, role, department, position } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        const invitedUser = await User.create({
            name: name || email.split('@')[0],
            email,
            passwordHash: '',
            role: role || 'Employee',
            department,
            position,
            status: 'Invited',
            inviteToken,
            inviteTokenExpiry,
        });

        await sendInviteEmail({
            to: email,
            name: invitedUser.name,
            invitedBy: (req as any).user?.name || 'HR Team',
            token: inviteToken,
        });

        res.status(201).json({ message: 'Invite sent successfully', userId: invitedUser.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc Get current user profile
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
