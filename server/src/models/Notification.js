import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required:true,
        enum: ['task_assigned', 'task_due_soon', 'task_overdue', 'onboarding_completed', 'comment_added']
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    readAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

notificationSchema.index({userId: 1, readAt: 1, createdAt: -1});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;