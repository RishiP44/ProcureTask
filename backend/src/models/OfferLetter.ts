import mongoose, { Schema, Document } from 'mongoose';

export interface IOfferLetter extends Document {
    candidate: {
        name: string;
        email: string;
    };
    position: string;
    department: string;
    salary: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

const OfferLetterSchema: Schema = new Schema({
    candidate: {
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    position: { type: String, required: true },
    department: { type: String, required: true },
    salary: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema);
