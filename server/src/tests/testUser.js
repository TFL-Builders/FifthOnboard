//Code used to test user schema and ensure it is working properly
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/user.js'

dotenv.config()

const testUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB Connected')

        // create a test user
        const user = await User.create({
            organizationId: new mongoose.Types.ObjectId(),
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
            name: 'Test User',
            role: 'employee',
            status: 'active'
        })

        console.log('User created:', user)

        // clean up - delete the test user after
        await User.deleteOne({ _id: user._id })
        console.log('Test user deleted')

    } catch (error) {
        console.error('Test failed:', error.message)
    } finally {
        mongoose.disconnect()
    }
}

testUser()