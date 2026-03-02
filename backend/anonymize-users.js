import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function anonymizeUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const nonAdminUsers = await User.find({ role: { $ne: 'admin' } });

        console.log(`Found ${nonAdminUsers.length} non-admin users to anonymize.`);

        for (let i = 0; i < nonAdminUsers.length; i++) {
            const user = nonAdminUsers[i];
            user.username = `dummy_user_${user._id.toString().substring(0, 8)}`;
            user.email = `dummy_user_${user._id.toString().substring(0, 8)}@example.com`;
            await user.save();
        }

        console.log('Successfully anonymized non-admin users.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

anonymizeUsers();
