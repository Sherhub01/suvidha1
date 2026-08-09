import "dotenv/config";

import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./router/authroutes.js";
import staffRoutes from "./router/staffRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import bookingRoutes from "./router/bookingRoutes.js";
import aiRoutes from "./router/aiRoutes.js";

import connectDB from "./config/db.js";
import { verifyMailer } from "./config/mailer.js";
import { seedAdmin } from "./controller/adminController.js";
import User from "./models/user.js";

import galleryRoutes from "./router/galleryRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }

            if (ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            if (origin.endsWith(".vercel.app")) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    })
);

app.use(express.json());

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/", (req, res) => {
    res.send("Suvidha1 backend running ✅");
});

const startServer = async () => {
    try {
        await connectDB();

        console.log("MongoDB connected successfully");

        const deleted = await User.deleteMany({
            $or: [
                { userName: null },
                { userName: { $exists: false } },
            ],
        });

        if (deleted.deletedCount > 0) {
            console.log(
                `♻️ Cleaned ${deleted.deletedCount} incomplete signup record(s)`
            );
        }

        await seedAdmin();

        console.log("Admin seed completed");

        await verifyMailer();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};

startServer();