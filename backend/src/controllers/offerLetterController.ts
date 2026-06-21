import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import OfferLetter from '../models/OfferLetter';
import User from '../models/User';
import { sendOfferLetterEmail } from '../services/emailService';
import { AuditLogService } from '../services/auditLogService';

// @desc    Get all offer letters (HR/Admin)
// @route   GET /api/offer-letters
// @access  Private
export const getOfferLetters = async (req: Request, res: Response) => {
    try {
        const offers = await OfferLetter.find()
            .populate('sentBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offer letters', error });
    }
};

// @desc    Create and dispatch a new offer letter
// @route   POST /api/offer-letters
// @access  Private
export const createOfferLetter = async (req: Request, res: Response) => {
    try {
        const {
            candidateName,
            candidateEmail,
            candidate,
            position,
            department,
            salary,
            startDate,
            message
        } = req.body;

        // Support both flat (web app) and nested (mobile app) shapes
        const name = candidate?.name || candidateName;
        const email = candidate?.email || candidateEmail;

        if (!name || !email || !position || !department) {
            return res.status(400).json({ message: 'Candidate details, position, and department are required' });
        }

        // Generate secure random token and expiration (7 days)
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const newOffer = new OfferLetter({
            candidate: { name, email },
            position,
            department,
            salary: Number(salary) || 0,
            startDate: startDate ? new Date(startDate) : new Date(),
            message,
            token,
            tokenExpiry,
            sentBy: (req as any).user?.id,
            status: 'pending'
        });

        const savedOffer = await newOffer.save();

        await AuditLogService.logAction({
            actorId: (req as any).user?.id,
            action: 'offer_letter_created',
            targetType: 'OfferLetter',
            targetId: savedOffer._id.toString(),
            details: `Offer letter created for candidate '${name}' (${email}) for position '${position}' by ${(req as any).user?.name || 'HR/Admin'}.`,
            metadata: { candidateName: name, candidateEmail: email, position, department, salary }
        });

        // Send actual email using SendGrid (non-blocking)
        sendOfferLetterEmail({
            to: email,
            candidateName: name,
            position,
            department,
            salary: Number(salary) || 0,
            token,
            message
        }).catch(err => console.error('Error sending offer letter email:', err));

        res.status(201).json(savedOffer);
    } catch (error: any) {
        console.error('Error creating offer letter:', error);
        res.status(400).json({ message: 'Error creating offer letter', error: error.message });
    }
};

// @desc    Get offer letter details by public token (Public)
// @route   GET /api/offer-letters/:token
// @access  Public
export const getOfferLetterByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const offer = await OfferLetter.findOne({ token }).populate('sentBy', 'name');

        if (!offer) {
            return res.status(404).json({ message: 'Offer letter not found' });
        }

        // Check if token expired
        if (offer.tokenExpiry && offer.tokenExpiry < new Date()) {
            return res.status(400).json({ message: 'Offer letter link has expired' });
        }

        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offer letter details', error });
    }
};

// @desc    Respond (accept or decline) to an offer letter (Public)
// @route   POST /api/offer-letters/:token/respond
// @access  Public
export const respondToOfferLetter = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { action, name, password } = req.body; // action: 'accepted' | 'declined'

        const offer = await OfferLetter.findOne({ token });
        if (!offer) {
            return res.status(404).json({ message: 'Offer letter not found' });
        }

        if (offer.status !== 'pending') {
            return res.status(400).json({ message: 'Offer has already been responded to' });
        }

        if (offer.tokenExpiry && offer.tokenExpiry < new Date()) {
            return res.status(400).json({ message: 'Offer letter link has expired' });
        }

        if (action === 'accepted') {
            if (!password || password.length < 6) {
                return res.status(400).json({ message: 'A password of at least 6 characters is required to accept' });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: offer.candidate.email });
            if (existingUser) {
                return res.status(400).json({ message: 'A user account with this email already exists' });
            }

            // Create active employee user account
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
                status: 'Active'
            });

            // Update offer letter status
            offer.status = 'accepted';
            await offer.save();

            await AuditLogService.logAction({
                actorId: newUser.id,
                action: 'offer_letter_accepted',
                targetType: 'OfferLetter',
                targetId: offer._id.toString(),
                details: `Offer letter for candidate '${offer.candidate.name}' was accepted, employee account created.`,
                metadata: { candidateEmail: offer.candidate.email, position: offer.position, department: offer.department }
            });

            return res.json({
                message: 'Offer accepted and user account created successfully',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } else if (action === 'declined') {
            offer.status = 'rejected';
            await offer.save();

            await AuditLogService.logAction({
                action: 'offer_letter_rejected',
                targetType: 'OfferLetter',
                targetId: offer._id.toString(),
                details: `Offer letter for candidate '${offer.candidate.name}' was declined.`,
                metadata: { candidateEmail: offer.candidate.email, position: offer.position, department: offer.department }
            });

            return res.json({ message: 'Offer declined successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid action. Must be accepted or declined' });
        }
    } catch (error: any) {
        console.error('Error responding to offer letter:', error);
        res.status(500).json({ message: 'Server Error responding to offer', error: error.message });
    }
};

// @desc    Revoke/delete an offer letter (HR/Admin)
// @route   DELETE /api/offer-letters/:id
// @access  Private
export const revokeOfferLetter = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const offer = await OfferLetter.findById(id);
        
        if (!offer) {
            return res.status(404).json({ message: 'Offer letter not found' });
        }

        await AuditLogService.logAction({
            actorId: (req as any).user?.id,
            action: 'offer_letter_revoked',
            targetType: 'OfferLetter',
            targetId: offer._id.toString(),
            details: `Offer letter for candidate '${offer.candidate.name}' was revoked by ${(req as any).user?.name || 'HR/Admin'}.`,
            metadata: { candidateName: offer.candidate.name, candidateEmail: offer.candidate.email }
        });

        await OfferLetter.findByIdAndDelete(id);
        res.json({ message: 'Offer letter revoked and deleted successfully' });
    } catch (error: any) {
        console.error('Error revoking offer letter:', error);
        res.status(500).json({ message: 'Error revoking offer letter', error: error.message });
    }
};

