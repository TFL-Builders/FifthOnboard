import mongoose from "mongoose";

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
    newHireName: {
        type: String,
        required: true
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
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived', 'cancelled']
    },
    progressPercent: {
        type: Number,
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
        this.hirePortalExpiresAt = new Date(this.startDate.getTime() + 90 * 24 * 60 * 60 * 1000)
    }
})

onboardingSchema.index({organizationId: 1, status: 1});
onboardingSchema.index({hirePortalTokenHash: 1}, {unique: true, sparse: true});

const Onboarding = mongoose.model('Onboarding', onboardingSchema);
export default Onboarding;