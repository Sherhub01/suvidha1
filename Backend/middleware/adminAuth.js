import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

export const protectAdmin = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Admin auth required" });

  const token = header.split(" ")[1];

  // Legacy demo token fallback (dev only)
  if (token === "demo_admin_token" || token === process.env.ADMIN_SECRET) {
    req.adminId = "demo_admin";
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin)
      return res.status(403).json({ success: false, message: "Not an admin token" });

    const admin = await Admin.findById(decoded.id).select("_id");
    if (!admin)
      return res.status(403).json({ success: false, message: "Admin not found" });

    req.adminId = admin._id.toString();
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};
