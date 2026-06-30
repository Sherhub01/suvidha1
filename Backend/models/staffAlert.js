import mongoose from "mongoose";

const staffAlertSchema = new mongoose.Schema({
  staff:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  type:     { type: String, enum: ["new_booking", "booking_cancelled", "booking_updated"], default: "new_booking" },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("StaffAlert", staffAlertSchema);
