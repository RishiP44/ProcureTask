import express from 'express';
import { createWorkflow, getWorkflows, getWorkflowById } from '../controllers/workflowController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Admin', 'HR'), createWorkflow)
    .get(protect, getWorkflows); // Admins/HR view all templates. Employees might not need this unless picking one, but usually assigned.

router.route('/:id')
    .get(protect, getWorkflowById);

export default router;
