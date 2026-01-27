import express from 'express';
import { getAllDocuments } from '../controllers/documentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, authorize('Admin', 'HR'), getAllDocuments);

export default router;
