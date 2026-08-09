import mongoose from "mongoose";

const pendingSignupSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["consumer", "staff"],
            required: true,
        },

        // Hashed OTP
        otpHash: {
            type: String,
            required: true,
        },

        otpExpire: {
            type: Date,
            required: true,
        },

        otpVerified: {
            type: Boolean,
            default: false,
        },

        // Automatically delete unfinished signup
        // after expiresAt
        expiresAt: {
            type: Date,
            required: true,
            index: {
                expires: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);


// Prevent duplicate pending signup
// for same email + role
pendingSignupSchema.index(
    {
        email: 1,
        role: 1,
    },
    {
        unique: true,
    }
);


const PendingSignup = mongoose.model(
    "PendingSignup",
    pendingSignupSchema
);

export default PendingSignup;