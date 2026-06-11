import express from 'express';
import { 
    createWorkflow, 
    getWorkflows, 
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow,
    checkWorkflowAssignments,
    getWorkflowHistory
} from '../controllers/workflowController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Admin', 'HR'), createWorkflow)
    .get(protect, getWorkflows);

router.route('/:id')
    .get(protect, getWorkflowById)
    .put(protect, authorize('Admin', 'HR'), updateWorkflow)
    .delete(protect, authorize('Admin', 'HR'), deleteWorkflow);

router.route('/:id/assignments-check')
    .get(protect, authorize('Admin', 'HR'), checkWorkflowAssignments);

router.route('/:id/history')
    .get(protect, authorize('Admin', 'HR'), getWorkflowHistory);

export default router;
