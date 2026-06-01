import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['admin', 'hr', 'manager', 'employee', 'task_owner']
    },
    tokenHash: {
        type: String,
        required: true,
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    acceptedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

inviteSchema.index({token: 1}, {unique: true});
inviteSchema.index({organizationId: 1, email:1});
inviteSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

const Invite = mongoose.model('Invite', inviteSchema);
export default Invite;