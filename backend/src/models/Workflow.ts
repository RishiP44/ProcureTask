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
    version: number;
    isLatest: boolean;
    rootId: mongoose.Types.ObjectId;
    isArchived: boolean;
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
    version: { type: Number, default: 1, required: true },
    isLatest: { type: Boolean, default: true, required: true },
    rootId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
    isArchived: { type: Boolean, default: false, required: true },
}, { timestamps: true });

// AI Assisted: Versioning logic - set rootId to own _id for the first version
WorkflowSchema.pre('save', function () {
    if (!(this as any).rootId) {
        (this as any).rootId = (this as any)._id;
    }
});

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
