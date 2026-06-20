import { Request, Response } from 'express';
import VendorBill from '../models/VendorBill';

export const createVendorBill = async (req: Request, res: Response) => {
    try {
        if ((req as any).user.role !== 'Vendor') {
            return res.status(403).json({ message: 'Only vendors can submit bills' });
        }

        const { invoiceNumber, billDate, category, description, subtotal, taxAmount = 0, currency = 'CAD', documentUrl } = req.body;
        const parsedSubtotal = Number(subtotal);
        const parsedTax = Number(taxAmount);
        if (!invoiceNumber || !billDate || !category || !documentUrl || !Number.isFinite(parsedSubtotal) || !Number.isFinite(parsedTax)) {
            return res.status(400).json({ message: 'Invoice number, date, category, amounts, and audited bill document are required' });
        }

        const bill = await VendorBill.create({
            vendor: (req as any).user.id,
            invoiceNumber,
            billDate,
            category,
            description,
            subtotal: parsedSubtotal,
            taxAmount: parsedTax,
            totalAmount: parsedSubtotal + parsedTax,
            currency,
            documentUrl
        });
        res.status(201).json(bill);
    } catch (error: any) {
        if (error?.code === 11000) return res.status(400).json({ message: 'This invoice number has already been submitted' });
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getVendorBills = async (req: Request, res: Response) => {
    try {
        const filter: any = {};
        if ((req as any).user.role === 'Vendor') filter.vendor = (req as any).user.id;
        if (req.query.vendorId && ['Admin', 'HR'].includes((req as any).user.role)) filter.vendor = req.query.vendorId;
        if (req.query.status) filter.status = req.query.status;

        const bills = await VendorBill.find(filter)
            .populate('vendor', 'name email companyName vendorType')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updateVendorBillStatus = async (req: Request, res: Response) => {
    try {
        const allowed = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'];
        if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid bill status' });
        const bill = await VendorBill.findByIdAndUpdate(req.params.id, {
            status: req.body.status,
            auditNotes: req.body.auditNotes,
            reviewedBy: (req as any).user.id,
            reviewedAt: new Date()
        }, { new: true, runValidators: true }).populate('vendor', 'name email companyName vendorType');
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const getVendorBillSummary = async (_req: Request, res: Response) => {
    try {
        const [summary, byVendor] = await Promise.all([
            VendorBill.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
                { $sort: { _id: 1 } }
            ]),
            VendorBill.aggregate([
                { $group: { _id: '$vendor', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'vendor' } },
                { $unwind: '$vendor' },
                { $project: { count: 1, total: 1, vendorId: '$_id', companyName: '$vendor.companyName', contactName: '$vendor.name' } },
                { $sort: { total: -1 } }
            ])
        ]);
        res.json({ summary, byVendor });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
