import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

// Verifies an admin JWT. There is deliberately no static/shared-secret
// fallback here — a bearer token must always map to a real Admin document.
export const protectAdmin = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Admin auth required" });

  const token = header.slice(7).trim();
  if (!token)
    return res.status(401).json({ success: false, message: "Admin auth required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin)
      return res.status(403).json({ success: false, message: "Not an admin token" });

    const admin = await Admin.findById(decoded.id).select("_id role");
    if (!admin)
      return res.status(403).json({ success: false, message: "Admin not found" });

    req.adminId   = admin._id.toString();
    req.adminRole = admin.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

// Guards destructive / privileged actions (creating admins, deleting accounts).
export const requireSuperAdmin = (req, res, next) => {
  if (req.adminRole !== "superadmin")
    return res.status(403).json({ success: false, message: "Super admin access required" });
  next();
};
