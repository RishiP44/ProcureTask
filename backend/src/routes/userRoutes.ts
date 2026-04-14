import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, getHRStats } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', protect, authorize('Admin', 'HR'), getHRStats);
router.get('/', protect, authorize('Admin', 'HR'), getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('Admin', 'HR'), deleteUser);

export default router;
