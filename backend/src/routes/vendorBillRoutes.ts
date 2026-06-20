import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware';
import { createVendorBill, getVendorBills, getVendorBillSummary, updateVendorBillStatus } from '../controllers/vendorBillController';

const router = express.Router();

router.get('/summary', protect, authorize('Admin', 'HR'), getVendorBillSummary);
router.route('/')
    .get(protect, authorize('Admin', 'HR', 'Vendor'), getVendorBills)
    .post(protect, authorize('Vendor'), createVendorBill);
router.put('/:id/status', protect, authorize('Admin', 'HR'), updateVendorBillStatus);

export default router;
