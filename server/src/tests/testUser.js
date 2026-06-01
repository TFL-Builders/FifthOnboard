import "dotenv/config"; 
import mongoose from 'mongoose';
import User from '../models/user.js';


const testUser = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/columbus")
        console.log('MongoDB Connected');

        const orgId = '6a1acc61bee1030094da295d'

        const hrUser = await User.create({
            organizationId: orgId,
            email: "maya@test.com",
            passwordHash: "test1234",
            name: "Maya Johnson",
            role: "hr",
            department: "hr",
            status: "active",
        });

        const itUser = await User.create({
            organizationId: orgId,
            email: "priya@test.com",
            passwordHash: "test1234",
            name: "Priya Patel",
            role: "task_owner",
            department: "it",
            status: "active",
        });

        const managerUser = await User.create({
            organizationId: orgId,
            email: "john@test.com",
            passwordHash: "test1234",
            name: "John Smith",
            role: "manager",
            department: "manager",
            status: "active",
        });

        

        console.log('Users created:');
        // clean up - delete the test user after
        

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        mongoose.disconnect();
    }
}

testUser();