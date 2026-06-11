import mongoose, { Schema, Document } from 'mongoose';

export interface IAlertLog extends Document {
    user?: mongoose.Types.ObjectId;
    assignment?: mongoose.Types.ObjectId;
    taskName?: string;
    type: 'in-app' | 'email' | 'sms';
    category: 'assignment_alert' | 'overdue_reminder' | 'missing_document' | 'task_completed';
    title: string;
    message: string;
    status: 'success' | 'failed';
    errorDetail?: string;
    sentAt: Date;
}

const AlertLogSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    taskName: { type: String },
    type: { type: String, enum: ['in-app', 'email', 'sms'], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    errorDetail: { type: String },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IAlertLog>('AlertLog', AlertLogSchema);
