import rateLimit from "express-rate-limit";

const json = (message) => (req, res) =>
    res.status(429).json({ success: false, message });

const base = {
    standardHeaders: "draft-7",
    legacyHeaders: false,
};

// Broad protection for the whole API surface.
export const apiLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 600,
    handler: json("Too many requests. Please slow down and try again shortly."),
});

// Credential endpoints — brute force protection.
export const authLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    handler: json("Too many login attempts. Please try again in 15 minutes."),
});

// OTP send/resend — prevents email flooding and OTP farming.
export const otpLimiter = rateLimit({
    ...base,
    windowMs: 10 * 60 * 1000,
    limit: 5,
    handler: json("Too many OTP requests. Please wait a few minutes before trying again."),
});

// Account creation.
export const signupLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: 15,
    handler: json("Too many signup attempts from this network. Please try again later."),
});

// Uploads are expensive — keep them bounded.
export const uploadLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 40,
    handler: json("Too many uploads. Please try again later."),
});

// Outbound AI calls cost money per request.
export const aiLimiter = rateLimit({
    ...base,
    windowMs: 5 * 60 * 1000,
    limit: 25,
    handler: json("You're sending messages too quickly. Please wait a moment."),
});
