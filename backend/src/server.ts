import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes';
import workflowRoutes from './routes/workflowRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import documentRoutes from './routes/documentRoutes';
import offerLetterRoutes from './routes/offerLetterRoutes';
import notificationRoutes from './routes/notificationRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/offer-letters', offerLetterRoutes);
app.use('/api/notifications', notificationRoutes);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/procuretrack';

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ MongoDB Connected'))
        .catch((err) => console.error('❌ MongoDB Connection Error:', err));
}

// Health check
app.get('/', (req: Request, res: Response) => {
    res.send('ProcureTask API is running');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
