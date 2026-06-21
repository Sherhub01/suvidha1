import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  message:  { type: String, required: true, trim: true },
  audience: { type: String, enum: ["all", "consumers", "staff"], default: "all" },
  sentBy:   { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
