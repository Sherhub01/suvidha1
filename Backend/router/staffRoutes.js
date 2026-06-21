import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "../middleware/auth.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import {
  getStaffProfile, saveStep, submitForReview, getApprovalStatus,
  getPendingStaff, approveStaff, rejectStaff, getStaffDetail,
} from "../controller/staffController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isPhoto = file.fieldname === "photo";
    cb(null, path.join(__dirname, "../uploads", isPhoto ? "avatars" : "docs"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId}-${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 6 * 1024 * 1024 } });
const docUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "aadhaarDoc", maxCount: 1 },
  { name: "panDoc", maxCount: 1 },
  { name: "certDoc", maxCount: 1 },
]);

const router = express.Router();

// Staff-facing routes (protected by JWT)
router.get("/profile",        protect, getStaffProfile);
router.post("/step",          protect, docUpload, saveStep);
router.post("/submit",        protect, submitForReview);
router.get("/status",         protect, getApprovalStatus);

// Admin-facing routes
router.get("/admin/list",              protectAdmin, getPendingStaff);
router.get("/admin/detail/:profileId", protectAdmin, getStaffDetail);
router.patch("/admin/approve/:profileId", protectAdmin, approveStaff);
router.patch("/admin/reject/:profileId",  protectAdmin, rejectStaff);

export default router;
