import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ["admin", "superadmin"], default: "admin" },
  // Forces a password change on first login for seeded accounts.
  mustChangePassword: { type: Boolean, default: false },
  otpHash:    { type: String, default: null },
  otpExpire:  { type: Date,   default: null },
  otpAttempts:{ type: Number, default: 0 },
}, { timestamps: true });

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("Admin", adminSchema);
