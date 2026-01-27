import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskInstance {
    _id: mongoose.Types.ObjectId; // Corresponds to the template task ID usually, or a new unique ID
    name: string;
    description?: string;
    type: 'checkbox' | 'document';
    required: boolean;
    status: 'pending' | 'completed';
    documentUrl?: string; // For document upload tasks
    completedAt?: Date;
}

export interface IAssignment extends Document {
    user: mongoose.Types.ObjectId;
    workflow: mongoose.Types.ObjectId;
    tasks: ITaskInstance[];
    status: 'pending' | 'in_progress' | 'completed';
    assignedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskInstanceSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['checkbox', 'document'], required: true },
    required: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    documentUrl: { type: String },
    completedAt: { type: Date },
}, { _id: true });

const AssignmentSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    tasks: [TaskInstanceSchema],
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
