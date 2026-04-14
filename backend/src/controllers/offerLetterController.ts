import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import OfferLetter from '../models/OfferLetter';
import User from '../models/User';
import Notification from '../models/Notification';
import { sendOfferLetterEmail } from '../services/emailService';
import { format } from 'date-fns';

// @desc  Send offer letter to a candidate
export const sendOfferLetter = async (req: Request, res: Response) => {
    const { candidateName, candidateEmail, position, department, startDate, salary, message } = req.body;

    try {
        const token = crypto.randomBytes(32).toString('hex');
        const offer = await OfferLetter.create({
            candidate: { name: candidateName, email: candidateEmail },
            position,
            department,
            startDate: new Date(startDate),
            salary,
            message,
            token,
            sentBy: (req as any).user.id,
            status: 'pending',
        });

        await sendOfferLetterEmail({
            to: candidateEmail,
            candidateName,
            position,
            department,
            startDate: format(new Date(startDate), 'MMMM d, yyyy'),
            salary,
            message,
            token,
        });

        res.status(201).json({ message: 'Offer letter sent successfully', offerId: offer.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc  Get offer letter by token (public — for candidate view)
export const getOfferLetterByToken = async (req: Request, res: Response) => {
    try {
        const offer = await OfferLetter.findOne({ token: req.params.token })
            .populate('sentBy', 'name email');
        if (!offer) return res.status(404).json({ message: 'Offer letter not found' });
        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc  Accept or decline offer letter
export const respondToOffer = async (req: Request, res: Response) => {
    const { action, name, password } = req.body; // action: 'accept' | 'decline'

    try {
        const offer = await OfferLetter.findOne({ token: req.params.token });
        if (!offer) return res.status(404).json({ message: 'Offer letter not found' });
        if (offer.status !== 'pending') {
            return res.status(400).json({ message: `Offer has already been ${offer.status}` });
        }

        if (action === 'accept') {
            offer.status = 'accepted';
            offer.acceptedAt = new Date();
            await offer.save();

            // Create user account for the new hire
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const newUser = await User.create({
                name: name || offer.candidate.name,
                email: offer.candidate.email,
                passwordHash,
                role: 'Employee',
                department: offer.department,
                position: offer.position,
                startDate: offer.startDate,
                status: 'Active',
            });

            const token = jwt.sign(
                { id: newUser.id, role: newUser.role }, 
                process.env.JWT_SECRET || 'secret', 
                { expiresIn: '30d' }
            );

            // Notify HR
            if (offer.sentBy) {
                await Notification.create({
                    user: offer.sentBy,
                    title: 'Offer Accepted! 🎉',
                    message: `${newUser.name} has accepted the offer for ${offer.position}.`,
                    type: 'offer_letter',
                    link: '/offer-letters'
                });
            }

            return res.json({
                message: 'Offer accepted! Account created.',
                user: {
                    _id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    token,
                }
            });
        } else {
            offer.status = 'declined';
            await offer.save();

            // Notify HR
            if (offer.sentBy) {
                await Notification.create({
                    user: offer.sentBy,
                    title: 'Offer Declined',
                    message: `${offer.candidate.name} has declined the offer for ${offer.position}.`,
                    type: 'offer_letter',
                    link: '/offer-letters'
                });
            }

            return res.json({ message: 'Offer declined.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc  Get all offer letters (HR view)
export const getAllOfferLetters = async (req: Request, res: Response) => {
    try {
        const offers = await OfferLetter.find()
            .populate('sentBy', 'name')
            .sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
