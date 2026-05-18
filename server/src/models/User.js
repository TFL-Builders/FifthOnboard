import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 80
    },
    role: {
        type: String,
        enum: ['admin', 'hr', 'manager', 'employee', 'task_owner']
    },
    avatarColor: {
        type: String
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'invited', 'disabled']
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

userSchema.index({organizationId: 1, email: 1}, {unique: true});
userSchema.index({role: 1});

const User = mongoose.model('User', userSchema);

export default User;