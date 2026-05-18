import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
        index: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    authorDisplayName: {
        type: String
    },
    body: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 4000
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

commentSchema.index({taskId: 1, createdAt: -1});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment