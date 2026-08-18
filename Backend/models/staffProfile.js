import mongoose from "mongoose";

const staffProfileSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  // Step 1 – Personal
  fullName:    { type: String, trim: true },
  dob:         { type: String },
  gender:      { type: String, enum: ["Male","Female","Other"] },
  bio:         { type: String },
  photo:       { type: String, default: null },
  // Step 2 – Contact & Address
  phone:       { type: String },
  street:      { type: String },
  city:        { type: String },
  state:       { type: String },
  pinCode:     { type: String },
  landmark:    { type: String },
  // Step 3 – Identity Documents
  // Stored filenames only (not URLs). Served through the authenticated
  // /api/staff/document route — never from the public /uploads mount.
  aadhaarDoc:  { type: String, default: null },
  panDoc:      { type: String, default: null },
  certDoc:     { type: String, default: null },
  aadhaarNo:   { type: String },
  panNo:       { type: String },
  // Step 4 – Category & Profession
  category:    { type: String },
  subCategory: { type: String },
  experience:  { type: Number },
  skills:      [{ type: String }],
  price:       { type: Number, default: 0 },
  priceType:   { type: String, enum: ["fixed", "hourly"], default: "fixed" },
  rating:      { type: Number, default: 0 },
  reviewsCount:{ type: Number, default: 0 },
  location: {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  },

  // Step 6 – Service Area
  serviceCity: { type: String },
  serviceRadius: { type: Number },
  preferredAreas: [{ type: String }],
  // Step 7 – Bank Details
  accountHolder: { type: String },
  accountNumber: { type: String },
  ifscCode:    { type: String },
  bankName:    { type: String },
  payoutMethod: { type: String, enum: ["Bank Transfer","UPI"], default: "Bank Transfer" },
  upiId:       { type: String },
  // Step 8 – Emergency Contact
  emergencyName:  { type: String },
  emergencyRelation: { type: String },
  emergencyPhone: { type: String },
  emergencyAlt:   { type: String },
  // Approval workflow
  currentStep:    { type: Number, default: 1 },
  completedSteps: [{ type: Number }],
  status: {
    type: String,
    enum: ["incomplete","pending","approved","rejected"],
    default: "incomplete",
  },
  rejectionReason: { type: String, default: null },
  submittedAt:     { type: Date, default: null },
  approvedAt:      { type: Date, default: null },
  approvedBy:      { type: String, default: null },
}, { timestamps: true });

staffProfileSchema.index({ location: "2dsphere" });

export default mongoose.model("StaffProfile", staffProfileSchema);
