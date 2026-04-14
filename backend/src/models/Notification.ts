import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'task_assigned' | 'offer_letter' | 'task_completed' | 'invite' | 'general';
    read: boolean;
    link?: string;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['task_assigned', 'offer_letter', 'task_completed', 'invite', 'general'],
        default: 'general'
    },
    read: { type: Boolean, default: false },
    link: { type: String },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
