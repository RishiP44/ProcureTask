import express from 'express';
import { registerUser, loginUser, inviteUser, getMe } from '../controllers/authController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/invite', protect, authorize('Admin', 'HR'), inviteUser);
router.get('/me', protect, getMe);

export default router;
