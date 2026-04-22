import express from 'express';
import { getOfferLetters, createOfferLetter, updateOfferStatus } from '../controllers/offerLetterController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getOfferLetters);
router.post('/', protect, authorize('Admin', 'HR'), createOfferLetter);
router.put('/:id/status', protect, authorize('Admin', 'HR'), updateOfferStatus);

export default router;
