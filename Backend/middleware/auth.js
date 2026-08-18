import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Extracts a Bearer token, or null when the header is missing/malformed.
const readBearer = (req) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return null;
    const token = header.slice(7).trim();
    return token || null;
};

// Verifies the JWT and populates req.userId / req.userRole.
// The role is carried inside the token so downstream guards never have to
// trust a client-supplied role field.
export const protect = (req, res, next) => {
    const token = readBearer(req);
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Admin tokens must not be usable on consumer/staff routes.
        if (decoded.isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        req.userId   = decoded.id;
        req.userRole = decoded.role || null;
        return next();
    } catch {
        return res.status(401).json({ success: false, message: "Token invalid or expired" });
    }
};

// Restricts a route to one or more roles. Tokens issued before roles were
// embedded fall back to a single database lookup instead of being rejected.
export const requireRole = (...roles) => async (req, res, next) => {
    if (!req.userId) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }

    let role = req.userRole;

    if (!role) {
        const user = await User.findById(req.userId).select("role").lean();
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        role = user.role;
        req.userRole = role;
    }

    if (!roles.includes(role)) {
        return res.status(403).json({
            success: false,
            message: `This action is only available to ${roles.join(" or ")} accounts.`,
        });
    }

    return next();
};

export const requireConsumer = requireRole("consumer");
export const requireStaff    = requireRole("staff");
