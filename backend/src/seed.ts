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

        // Check if demo vendor exists
        const vendorExists = await User.findOne({ email: 'vendor@example.com' });
        if (vendorExists) {
            console.log('⚠️ Vendor user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            vendorExists.passwordHash = await bcrypt.hash('password123', salt);
            vendorExists.role = 'Vendor';
            vendorExists.companyName = 'Apex Tech Solutions';
            vendorExists.vendorType = 'Software & IT Services';
            vendorExists.taxId = '99-1234567';
            vendorExists.website = 'https://apextech.example.com';
            vendorExists.address = '100 Enterprise Way, Suite 400, Silicon Valley, CA';
            await vendorExists.save();
            console.log('✅ Vendor password reset to: password123');
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password123', salt);

            await User.create({
                name: 'Jane Smith',
                email: 'vendor@example.com',
                passwordHash,
                role: 'Vendor',
                companyName: 'Apex Tech Solutions',
                vendorType: 'Software & IT Services',
                taxId: '99-1234567',
                website: 'https://apextech.example.com',
                address: '100 Enterprise Way, Suite 400, Silicon Valley, CA',
                status: 'Active'
            });
            console.log('✅ Vendor user created: vendor@example.com / password123');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seed();
