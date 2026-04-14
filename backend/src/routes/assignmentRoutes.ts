import express from 'express';
import { assignWorkflow, getMyAssignments, getAllAssignments, updateTaskStatus, getAssignmentById } from '../controllers/assignmentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Admin', 'HR'), assignWorkflow)
    .get(protect, authorize('Admin', 'HR'), getAllAssignments);

router.get('/my-assignments', protect, getMyAssignments);
router.get('/:id', protect, getAssignmentById);
router.put('/:id/tasks/:taskId', protect, updateTaskStatus);

export default router;
