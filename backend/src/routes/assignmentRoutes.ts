import express from 'express';
import { assignWorkflow, getMyAssignments, getAllAssignments, updateTaskStatus } from '../controllers/assignmentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Admin', 'HR'), assignWorkflow)
    .get(protect, authorize('Admin', 'HR'), getAllAssignments);

router.get('/my-assignments', protect, getMyAssignments);

router.put('/:id/tasks/:taskId', protect, updateTaskStatus);

export default router;
