import { Request, Response } from 'express';
import OfferLetter from '../models/OfferLetter';

// @desc    Get all offer letters
export const getOfferLetters = async (req: Request, res: Response) => {
    try {
        const offers = await OfferLetter.find().sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Create a new offer letter
export const createOfferLetter = async (req: Request, res: Response) => {
    try {
        const { candidateName, candidateEmail, position, department, startDate, salary, message } = req.body;

        const offer = await OfferLetter.create({
            candidate: {
                name: candidateName,
                email: candidateEmail
            },
            position,
            department,
            startDate,
            salary,
            message,
            sentBy: (req as any).user.id
        });

        res.status(201).json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update offer status
export const updateOfferStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const offer = await OfferLetter.findById(req.params.id);

        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        offer.status = status;
        await offer.save();
        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
