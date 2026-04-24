import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user?: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: string;
    link?: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    link: { type: String },
    read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
