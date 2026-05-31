import mongoose from "mongoose";
import { ONBOARDING_STATUSES } from "../config/constants.js";

const onboardingSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template'
    },
    templateName: {
        type: String,
        default: null
    },
    newHireName: {
        type: String,
        required: true
    },
    job: {
        type: String,
        default: null
    },
    newHireEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ONBOARDING_STATUSES,
        default: 'active'
    },
    warnings: {
        hasUnassignedTasks: {
            type: Boolean,
            default: false
        },
        hasNoManager: {
            type: Boolean,
            default: false
        }
    },
    progressPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    hirePortalTokenHash: {
        type: String,
    },
    hirePortalExpiresAt: {
        type: Date
    },
    completedAt: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

onboardingSchema.pre('save', async function(){
    if (this.isNew && this.startDate) {
        this.hirePortalExpiresAt = new Date(this.startDate.getTime() + 90 * 24 * 60 * 60 * 1000) //90 days
    }
})

onboardingSchema.index({organizationId: 1, status: 1});
onboardingSchema.index({hirePortalTokenHash: 1}, {unique: true, sparse: true});

const Onboarding = mongoose.model('Onboarding', onboardingSchema);
export default Onboarding;