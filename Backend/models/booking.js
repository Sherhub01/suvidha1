import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  consumer:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  staff:        { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  staffProfile: { type: mongoose.Schema.Types.ObjectId, ref: "StaffProfile", default: null },
  service:      { type: String, required: true },
  category:     { type: String, required: true },
  description:  { type: String, default: "" },
  date:         { type: String, required: true },
  time:         { type: String, required: true },
  address:      { type: String, required: true },
  price:        { type: String, default: "" },
  paymentMethod:{ type: String, default: "Cash" },
  paymentStatus:{ type: String, enum: ["Pending","Paid","Refunded"], default: "Pending" },
  status:       { type: String, enum: ["Scheduled","Confirmed","Completed","Cancelled"], default: "Scheduled" },
  rating:       { type: Number, default: null },
  workerPhoto:  { type: String, default: null },
  workerName:   { type: String, default: "" },
  workerPhone:  { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
