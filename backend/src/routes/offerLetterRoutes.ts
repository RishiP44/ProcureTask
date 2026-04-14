import express from 'express';
import { sendOfferLetter, getOfferLetterByToken, respondToOffer, getAllOfferLetters } from '../controllers/offerLetterController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// HR routes (protected)
router.post('/', protect, authorize('Admin', 'HR'), sendOfferLetter);
router.get('/', protect, authorize('Admin', 'HR'), getAllOfferLetters);

// Public routes (for candidate)
router.get('/:token', getOfferLetterByToken);
router.post('/:token/respond', respondToOffer);

export default router;
