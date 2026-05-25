import mongoose from 'mongoose';
import slugify from 'slugify';

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 80
    },
    slug: {
        type: String,
    },
    logoUrl: {
        type: String
    },
    accentColor: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true});

organizationSchema.pre('save', async function() {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true
        })
    }
});

organizationSchema.index({slug: 1}, {unique: true});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;