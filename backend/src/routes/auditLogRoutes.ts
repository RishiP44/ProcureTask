import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Only Admin and HR are authorized to fetch audit logs
router.route('/')
    .get(protect, authorize('Admin', 'HR'), getAuditLogs);

export default router;
