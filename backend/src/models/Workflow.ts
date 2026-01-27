import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskTemplate {
    name: string;
    description?: string;
    type: 'checkbox' | 'document';
    required: boolean;
}

export interface IWorkflow extends Document {
    name: string;
    description: string;
    tasks: ITaskTemplate[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskTemplateSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['checkbox', 'document'], required: true },
    required: { type: Boolean, default: true },
}, { _id: true }); // Keep _id for tasks to easily track them

const WorkflowSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    tasks: [TaskTemplateSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
