import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';

dotenv.config();

const seed = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/procuretrack';
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            console.log('⚠️ Admin user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            adminExists.passwordHash = await bcrypt.hash('password123', salt);
            await adminExists.save();
            console.log('✅ Admin password reset to: password123');
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password123', salt);

            await User.create({
                name: 'System Admin',
                email: 'admin@example.com',
                passwordHash,
                role: 'Admin'
            });
            console.log('✅ Admin user created: admin@example.com / password123');
        }

        // Check if employee exists
        const employeeExists = await User.findOne({ email: 'employee@example.com' });
        if (employeeExists) {
            console.log('⚠️ Employee user already exists.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password123', salt);

            await User.create({
                name: 'John Doe',
                email: 'employee@example.com',
                passwordHash,
                role: 'Employee'
            });
            console.log('✅ Employee user created: employee@example.com / password123');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seed();
