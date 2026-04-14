import mongoose, { Schema, Document } from 'mongoose';

export interface IOfferLetter extends Document {
    candidate: {
        name: string;
        email: string;
    };
    position: string;
    department: string;
    startDate: Date;
    salary?: string;
    token: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    sentBy: mongoose.Types.ObjectId;
    acceptedAt?: Date;
    message?: string;
    createdAt: Date;
}

const OfferLetterSchema: Schema = new Schema({
    candidate: {
        name: { type: String, required: true },
        email: { type: String, required: true },
    },
    position: { type: String, required: true },
    department: { type: String, required: true },
    startDate: { type: Date, required: true },
    salary: { type: String },
    token: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired'],
        default: 'pending'
    },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    acceptedAt: { type: Date },
    message: { type: String },
}, { timestamps: true });

export default mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema);
