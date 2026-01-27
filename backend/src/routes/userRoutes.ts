import express from 'express';
import { getUsers } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, authorize('Admin', 'HR'), getUsers);

export default router;
