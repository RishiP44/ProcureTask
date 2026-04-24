import express from 'express';
import { getOfferLetters, createOfferLetter } from '../controllers/offerLetterController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getOfferLetters)
    .post(protect, createOfferLetter);

export default router;
