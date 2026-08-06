import mongoose from "mongoose";

const consumerAlertSchema = new mongoose.Schema({
  consumer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking:  { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  type:     { type: String, enum: ["booking_confirmed","booking_completed","booking_cancelled","general"], default: "general" },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
}, { timestamps: true });

consumerAlertSchema.index({ consumer: 1, createdAt: -1 });

export default mongoose.model("ConsumerAlert", consumerAlertSchema);
