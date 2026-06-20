import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorBill extends Document {
    vendor: mongoose.Types.ObjectId;
    invoiceNumber: string;
    billDate: Date;
    category: string;
    description?: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    documentUrl: string;
    status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
    auditNotes?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const VendorBillSchema = new Schema({
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceNumber: { type: String, required: true, trim: true },
    billDate: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'CAD', uppercase: true },
    documentUrl: { type: String, required: true },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'],
        default: 'Submitted',
        index: true
    },
    auditNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
}, { timestamps: true });

VendorBillSchema.index({ vendor: 1, invoiceNumber: 1 }, { unique: true });

export default mongoose.model<IVendorBill>('VendorBill', VendorBillSchema);
