import mongoose, { Schema, Document } from 'mongoose';

// Item item structure within the shipment order
export interface IShipmentItem {
    name: string;
    qty: number;
    price: number;
}

// ShipmentOrder document interface
export interface IShipmentOrder extends Document {
    orderNumber: string;
    vendor: mongoose.Types.ObjectId;
    description: string;
    totalLoad: string; // e.g. "24 Pallets / 12,000 lbs"
    carrier?: string; // e.g. "Swift Transport"
    items: IShipmentItem[];
    totalAmount: number;
    billUrl?: string; // Path to the uploaded invoice bill
    paymentStatus: 'Unpaid' | 'Paid';
    paymentDetails?: {
        method: string; // e.g. "ACH", "Wire Transfer", "Credit Card"
        reference: string; // transaction ID
        paidAt: Date;
    };
    status: 'Pending Bill' | 'Under Audit' | 'Awaiting Payment' | 'Paid / Cleared';
    createdAt: Date;
    updatedAt: Date;
}

const ShipmentItemSchema = new Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
});

const ShipmentOrderSchema: Schema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    totalLoad: { type: String, required: true },
    carrier: { type: String },
    items: [ShipmentItemSchema],
    totalAmount: { type: Number, required: true },
    billUrl: { type: String },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
    paymentDetails: {
        method: { type: String },
        reference: { type: String },
        paidAt: { type: Date },
    },
    status: { 
        type: String, 
        enum: ['Pending Bill', 'Under Audit', 'Awaiting Payment', 'Paid / Cleared'], 
        default: 'Pending Bill' 
    },
}, { timestamps: true });

export default mongoose.model<IShipmentOrder>('ShipmentOrder', ShipmentOrderSchema);
