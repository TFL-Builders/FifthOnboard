//Code used to test user schema and ensure it is working properly
import mongoose from 'mongoose';
import User from '../models/user.js';

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// point explicitly to server/.env from server/src/tests/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const testUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // create a test user
        const user = await User.create({
            organizationId: new mongoose.Types.ObjectId(),
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
            name: 'Test User',
            role: 'employee',
            status: 'active'
        });

        console.log('User created:', user);
        console.log('User id:', user._id.toString());
        console.log(typeof(user._id));

        // clean up - delete the test user after
        

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        mongoose.disconnect();
    }
}

testUser();