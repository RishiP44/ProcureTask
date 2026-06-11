import express from 'express';
import { 
    getOfferLetters, 
    createOfferLetter, 
    getOfferLetterByToken, 
    respondToOfferLetter,
    revokeOfferLetter
} from '../controllers/offerLetterController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getOfferLetters)
    .post(protect, createOfferLetter);

router.route('/:id')
    .delete(protect, revokeOfferLetter);

router.route('/:token')
    .get(getOfferLetterByToken);

router.route('/:token/respond')
    .post(respondToOfferLetter);

export default router;
