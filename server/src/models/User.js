import mongoose from 'mongoose';
import bcryptjs from "bcryptjs";
import { DEPARTMENTS, USER_ROLES } from "../config/constants.js";

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
        enum: USER_ROLES
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
    department: {
        type: String,
        enum: DEPARTMENTS,
        default: null
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


const AVATAR_COLORS = [
    "#3B5BDB", "#0EA5E9", "#16A34A", "#D97706",
    "#DC2626", "#7C3AED", "#DB2777", "#0891B2",
    "#059669", "#EA580C"
];

userSchema.pre("save", async function() {
    if (!this.passwordHash || !this.isModified("passwordHash")) return;
        this.passwordHash = await bcryptjs.hash(
        this.passwordHash, 
        parseInt(process.env.BCRYPTJS_SALT_ROUNDS)
    );

    if (!this.avatarColor && this.name) {
        let hash = 0;
        for (let i = 0; i < this.name.length; i++) {
            hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        this.avatarColor = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }
});

userSchema.methods.comparePassword = async function(plainTextPassword) {
  return bcryptjs.compare(plainTextPassword, this.passwordHash);
};

userSchema.index({organizationId: 1, email: 1}, {unique: true});
userSchema.index({role: 1});


const User = mongoose.model('User', userSchema);

export default User;