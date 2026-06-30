import mongoose from "mongoose";

const consumerAlertSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  type:     { type: String, enum: ["booking_confirmed", "booking_completed", "booking_cancelled", "booking_scheduled"], default: "booking_scheduled" },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("ConsumerAlert", consumerAlertSchema);
