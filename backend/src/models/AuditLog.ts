import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    actor?: mongoose.Types.ObjectId;
    action: string;
    targetType: 'Workflow' | 'Assignment' | 'User' | 'VendorBill' | 'OfferLetter' | 'Integration';
    targetId: mongoose.Types.ObjectId;
    details: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    action: { type: String, required: true },
    targetType: { 
        type: String, 
        enum: ['Workflow', 'Assignment', 'User', 'VendorBill', 'OfferLetter', 'Integration'], 
        required: true 
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, required: false }
}, { timestamps: true });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
