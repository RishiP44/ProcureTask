import { Request, Response } from 'express';
import OfferLetter from '../models/OfferLetter';

export const getOfferLetters = async (req: Request, res: Response) => {
    try {
        const offers = await OfferLetter.find().sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offer letters' });
    }
};

export const createOfferLetter = async (req: Request, res: Response) => {
    try {
        const newOffer = new OfferLetter(req.body);
        const savedOffer = await newOffer.save();
        res.status(201).json(savedOffer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating offer letter' });
    }
};
