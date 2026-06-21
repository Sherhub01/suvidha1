import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes    from "./router/authroutes.js";
import staffRoutes   from "./router/staffRoutes.js";
import adminRoutes   from "./router/adminRoutes.js";
import bookingRoutes from "./router/bookingRoutes.js";
import aiRoutes      from "./router/aiRoutes.js";
import connectDB from "./config/db.js";
import { seedAdmin } from "./controller/adminController.js";

dotenv.config();
connectDB()
  .then(() => seedAdmin())
  .catch((err) => console.error("DB connection failed:", err));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));
app.use(express.json());

// Serve uploaded avatars
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth",     authRoutes);
app.use("/api/staff",    staffRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai",       aiRoutes);

app.get("/", (req, res) => res.send("Suvidha1 backend running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
