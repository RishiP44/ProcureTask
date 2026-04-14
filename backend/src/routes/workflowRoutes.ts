import express from 'express';
import { 
    createWorkflow, 
    getWorkflows, 
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow
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

export default router;
