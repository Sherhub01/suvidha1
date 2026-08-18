import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./router/authroutes.js";
import staffRoutes from "./router/staffRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import bookingRoutes from "./router/bookingRoutes.js";
import aiRoutes from "./router/aiRoutes.js";
import galleryRoutes from "./router/galleryRoutes.js";

import connectDB from "./config/db.js";
import { verifyMailer } from "./config/mailer.js";
import { seedAdmin } from "./controller/adminController.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { sanitizeRequest } from "./middleware/sanitize.js";
import { AVATAR_DIR } from "./middleware/upload.js";
import { isProduction } from "./utils/security.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

// ── Required configuration ─────────────────────────────────
// Fail fast instead of booting a server that silently signs tokens with
// `undefined` or connects to no database.
const REQUIRED_ENV = ["JWT_SECRET", "MONGO_URI"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length) {
    console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
    const message =
        "JWT_SECRET must be at least 32 characters. Generate one with: " +
        "node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"";
    if (isProduction()) {
        console.error(message);
        process.exit(1);
    }
    console.warn(`${message} (continuing in development)`);
}

// Behind Render/Vercel/NGINX the client IP arrives in X-Forwarded-For, which
// rate limiting needs in order to key on the real caller.
app.set("trust proxy", 1);

// ── Security headers ───────────────────────────────────────
app.use(
    helmet({
        // The API serves JSON and images consumed by a separate origin.
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
    })
);

// ── CORS ───────────────────────────────────────────────────
// Explicit allow-list. The previous build accepted any *.vercel.app origin,
// which let any preview deployment on the platform call this API.
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));

app.use(
    cors({
        origin: (origin, callback) => {
            // Same-origin and server-to-server requests send no Origin header.
            if (!origin) return callback(null, true);
            if (ALLOWED_ORIGINS.includes(origin.replace(/\/$/, ""))) return callback(null, true);
            return callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    })
);

// ── Body parsing & sanitisation ────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Strips $-prefixed and dotted keys so a crafted body cannot inject Mongo
// query operators into a login or lookup query.
app.use(sanitizeRequest);

app.use(apiLimiter);

// ── Static files ───────────────────────────────────────────
// Only avatars are public. Identity documents live in uploads/docs and are
// served exclusively through the authenticated /api/staff/document route.
app.use(
    "/uploads/avatars",
    express.static(AVATAR_DIR, {
        maxAge: "7d",
        setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    })
);

// ── Routes ─────────────────────────────────────────────────
app.get("/health", (req, res) =>
    res.json({ success: true, status: "ok", uptime: process.uptime() })
);

app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/", (req, res) => {
    res.json({ success: true, message: "Suvidha1 backend running" });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ── Error handler ──────────────────────────────────────────
// Internal error details are logged but never returned to the client.
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err?.message?.startsWith("CORS blocked")) {
        return res.status(403).json({ success: false, message: "Origin not allowed" });
    }

    console.error("Unhandled error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
});

// ── Startup ────────────────────────────────────────────────
const startServer = async () => {
    try {
        await connectDB();

        await seedAdmin();
        await verifyMailer();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
        });

        const shutdown = (signal) => () => {
            console.log(`${signal} received, shutting down...`);
            server.close(() => process.exit(0));
            setTimeout(() => process.exit(1), 10000).unref();
        };

        process.on("SIGTERM", shutdown("SIGTERM"));
        process.on("SIGINT", shutdown("SIGINT"));
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
