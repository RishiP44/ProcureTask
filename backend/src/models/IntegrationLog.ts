import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface defining the structure of an IntegrationLog document.
 * Tracks enterprise integration sync jobs and webhook payloads.
 */
export interface IIntegrationLog extends Document {
    provider: 'workday' | 'bamboohr' | 'salesforce' | 'sap' | 'custom' | string;
    eventType: string; // e.g., 'batch.sync', 'employee.hired', 'vendor.created'
    status: 'Success' | 'Failed';
    recordsProcessed: number;
    payload?: any; // Stores raw JSON payload for inspection
    details: string;
    durationMs: number;
    createdAt: Date;
}

// Mongoose schema for integration history logging
const IntegrationLogSchema: Schema = new Schema({
    provider: { type: String, required: true },
    eventType: { type: String, required: true },
    status: { type: String, enum: ['Success', 'Failed'], required: true },
    recordsProcessed: { type: Number, default: 0 },
    payload: { type: Schema.Types.Mixed, default: {} },
    details: { type: String, required: true },
    durationMs: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IIntegrationLog>('IntegrationLog', IntegrationLogSchema);
