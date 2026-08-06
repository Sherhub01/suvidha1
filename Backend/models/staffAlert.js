import mongoose from "mongoose";

const staffAlertSchema = new mongoose.Schema({
  staff:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  type:    { type: String, enum: ["new_booking","booking_cancelled","booking_updated","general"], default: "general" },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

staffAlertSchema.index({ staff: 1, createdAt: -1 });

export default mongoose.model("StaffAlert", staffAlertSchema);
