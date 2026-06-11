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
    token: string;
    tokenExpiry?: Date;
    startDate: Date;
    message?: string;
    sentBy?: mongoose.Types.ObjectId;
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
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    token: { type: String, required: true, unique: true },
    tokenExpiry: { type: Date },
    startDate: { type: Date, required: true, default: Date.now },
    message: { type: String },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema);
