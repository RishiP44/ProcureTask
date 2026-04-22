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
    message?: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    sentBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const OfferLetterSchema: Schema = new Schema({
    candidate: {
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    position: { type: String, required: true },
    department: { type: String, required: true },
    startDate: { type: Date, required: true },
    salary: { type: String },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema);
