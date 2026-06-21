import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName:        { type: String, required: true, trim: true },
    lastName:         { type: String, required: true, trim: true },
    email:            { type: String, required: true, lowercase: true },
    phone:            { type: String, required: true },
    password:         { type: String, required: true },
    role:             { type: String, enum: ["consumer", "staff"], required: true },
    userName:         { type: String, sparse: true, lowercase: true, minlength: 6 },
    avatar:           { type: String, default: null },
    address:          { type: String, default: null },
    bio:              { type: String, default: null },
    profileCompleted: { type: Boolean, default: false },
    location: {
        type:        { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },
    otp:        { type: String, default: null },
    otpExpire:  { type: Date,   default: null },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// email+role must be unique — same email can exist as consumer AND staff
userSchema.index({ email: 1, role: 1 }, { unique: true });
userSchema.index({ userName: 1, role: 1 }, { unique: true, sparse: true });
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
