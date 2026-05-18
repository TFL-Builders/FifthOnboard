import mongoose from "mongoose";

const templateTasksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    assigneeRole: {
        type: String,
        enum: ['hr', 'manager', 'new_hire', 'it', 'finance', 'custom']
    },
    assigneeUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dueOffsetDays: {
        type: Number,
        default: 0,
        validate: {
        validator: Number.isInteger,
        message: 'order must be an integer'
        }
    },
    phase: {
        type: String,
        enum: ['pre_start', 'week_1', 'week_2', 'week_3_plus']
    },
    order: {
    type: Number,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: 'order must be an integer'
        }
    },
    requiresUpload: {
        type: Boolean,
        default: false
    }
});

const templateSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 120
    },
    description: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    templateTasks: [templateTasksSchema],
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

templateSchema.index({organizationId: 1, isArchived: 1});

const Template = mongoose.model('Template', templateSchema);
export default Template;