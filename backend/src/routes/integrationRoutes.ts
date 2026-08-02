import express from 'express';
import { syncProvider, receiveWebhook, getIntegrationLogs } from '../controllers/integrationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Enterprise Integration Routes
 */

// 1. Batch sync simulation endpoint (Protected)
router.post('/sync/:provider', protect, syncProvider);

// 2. Webhook receiver endpoint (Public for external webhook postman tests)
router.post('/webhook/:provider', receiveWebhook);

// 3. Integration logs endpoint (Protected for Admin & HR)
router.get('/logs', protect, authorize('Admin', 'HR'), getIntegrationLogs);

export default router;
