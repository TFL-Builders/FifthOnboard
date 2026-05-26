import mongoose from 'mongoose';
import "../models/User.js";
import "../models/Organization.js";
import "../models/RefreshToken.js";
import "../models/Invite.js";
import "../models/AuditLog.js";
import "../models/Comment.js";
import "../models/Notification.js";
import "../models/Onboarding.js";
import "../models/Task.js";
import "../models/Template.js";

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI, {});
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }   catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;