import crypto from "crypto";

// ── Password policy ────────────────────────────────────────
// Minimum 8 characters with at least one letter and one digit. Kept in one
// place so signup, reset and change-password all enforce the same rule.
export const PASSWORD_MIN_LENGTH = 8;

export const validatePassword = (password = "") => {
    if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    }
    if (password.length > 128) {
        return "Password must be 128 characters or fewer.";
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return "Password must contain at least one letter and one number.";
    }
    return null;
};

// ── OTP hashing ────────────────────────────────────────────
// OTPs are stored as SHA-256 digests so a database leak cannot be replayed.
export const hashOtp = (otp) =>
    crypto.createHash("sha256").update(String(otp)).digest("hex");

// Constant-time compare to avoid leaking the OTP through timing.
export const verifyOtpHash = (otp, storedHash) => {
    if (!storedHash) return false;
    const candidate = Buffer.from(hashOtp(otp), "hex");
    const expected  = Buffer.from(storedHash, "hex");
    if (candidate.length !== expected.length) return false;
    return crypto.timingSafeEqual(candidate, expected);
};

// ── Field whitelisting ─────────────────────────────────────
// Copies only the named keys from an untrusted payload. Prevents mass
// assignment (e.g. a staff member setting their own `status: "approved"`).
export const pickFields = (source = {}, allowed = []) => {
    const out = {};
    if (!source || typeof source !== "object") return out;
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
            out[key] = source[key];
        }
    }
    return out;
};

// ── Misc validators ────────────────────────────────────────
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email = "") => EMAIL_REGEX.test(String(email).trim());

export const isValidPhone = (phone = "") => /^[6-9]\d{9}$/.test(String(phone).trim());

export const isProduction = () => process.env.NODE_ENV === "production";
