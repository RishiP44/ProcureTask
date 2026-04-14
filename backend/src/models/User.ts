import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'Admin' | 'HR' | 'Employee' | 'Vendor';
    // HR / Employee extended profile
    department?: string;
    position?: string;
    phone?: string;
    startDate?: Date;
    status: 'Active' | 'Inactive' | 'Pending' | 'Invited';
    avatar?: string;
    // Invite / offer-letter token
    inviteToken?: string;
    inviteTokenExpiry?: Date;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, default: '' },
    role: {
        type: String,
        enum: ['Admin', 'HR', 'Employee', 'Vendor'],
        default: 'Employee'
    },
    department: { type: String },
    position: { type: String },
    phone: { type: String },
    startDate: { type: Date },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending', 'Invited'],
        default: 'Active'
    },
    avatar: { type: String },
    inviteToken: { type: String },
    inviteTokenExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
