import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    onboardingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Onboarding',
        index: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    actorLabel: {
        type: String
    },
    action: {
        type: String,
        required: true,
        enum:  ['onboarding.created', 'task.assigned', 'task.completed',
                'task.blocked', 'task.unblocked', 'comment.added',
                'template.created', 'template.updated', 'user.invited']
    },
    targetType: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

auditLogSchema.index({organizationId: 1, createdAt: -1});
auditLogSchema.index({onboardingId: 1, createdAt: -1});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;