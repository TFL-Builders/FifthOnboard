import mongoose from "mongoose";
import { DEPARTMENTS, PHASES, TASK_STATUSES } from "../config/constants.js";

const attachmentSchema = new mongoose.Schema({
    fileName:  {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    sizeBytes: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    uploadedByNewHire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Onboarding',
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const taskSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    onboardingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Onboarding',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    assigneeUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assigneeDepartment: {
        type: String,
        enum: DEPARTMENTS
    },
    dueAt: {
        type: Date
    },
    phase: {
        type: String,
        enum: PHASES
    },
    status: {
        type: String,
        enum: TASK_STATUSES,
        default: 'pending'
    },
    blockedReason: {
        type: String
    },
    completedAt: {
        type: Date,
        default: null
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    requiresUpload: {
        type: Boolean,
        default: false
    },
    attachments: [attachmentSchema],
    order: {
    type: Number,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: 'order must be an integer'
        }
    }
}, {timestamps: true});

taskSchema.index({organizationId: 1, onboardingId: 1});
taskSchema.index({assigneeUserId: 1, status: 1, dueAt: 1});
taskSchema.index({dueAt: 1, status: 1});

const Task = mongoose.model('Task', taskSchema);
export default Task;