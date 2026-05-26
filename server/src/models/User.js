import mongoose from 'mongoose';
import bcryptjs from "bcryptjs";

const salt_rounds = 10;
const userSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: false,
        index: true
    },
    googleId: {
        type: String,
        required: false,
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
        default: null,
        required: false
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
        enum: ['active', 'pending', 'invited', 'disabled']
    },
    theme: {
        type: String,
        enum: ['dark', 'light', null],
        default: null,
        required: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpiry: {
        type: Number,
        default: null
    }
}, {timestamps: true});


userSchema.pre("save", async function() {
  if (!this.passwordHash || !this.isModified("passwordHash")) return;

  this.passwordHash = await bcryptjs.hash(this.passwordHash, parseInt(process.env.BCRYPTJS_SALT_ROUNDS));
});

// instance method — available on every user document
userSchema.methods.comparePassword = async function(plainTextPassword) {
  return bcryptjs.compare(plainTextPassword, this.passwordHash);
};

userSchema.index({organizationId: 1, email: 1}, {unique: true});
userSchema.index({role: 1});


const User = mongoose.model('User', userSchema);

export default User;