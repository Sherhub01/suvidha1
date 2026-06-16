import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName:        { type: String, required: true, trim: true },
    lastName:         { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true },
    phone:            { type: String, required: true },
    password:         { type: String, required: true },
    userName:         { type: String, unique: true, sparse: true, lowercase: true, minlength: 6 },
    avatar:           { type: String, default: null },
    address:          { type: String, default: null },
    bio:              { type: String, default: null },
    profileCompleted: { type: Boolean, default: false },
    location: {
        type:    { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    otp:              { type: String, default: null },
    otpExpire:        { type: Date, default: null },
    isVerified:       { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
