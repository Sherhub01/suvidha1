import express from "express";

import { protect } from "../middleware/auth.js";
import { protectAdmin } from "../middleware/adminAuth.js";
import { validate, serviceSchema, serviceUpdateSchema } from "../middleware/validate.js";
import {
  listServices, getService,
  adminListServices, adminCreateService, adminUpdateService,
  adminToggleService, adminDeleteService,
} from "../controller/serviceController.js";

const router = express.Router();

// ── Catalogue (signed-in users) ────────────────────────────
router.get("/", protect, listServices);
router.get("/:slug", protect, getService);

// ── Admin ──────────────────────────────────────────────────
router.get("/admin/all", protectAdmin, adminListServices);
router.post("/admin", protectAdmin, validate(serviceSchema), adminCreateService);
router.patch("/admin/:id", protectAdmin, validate(serviceUpdateSchema), adminUpdateService);
router.patch("/admin/:id/toggle", protectAdmin, adminToggleService);
router.delete("/admin/:id", protectAdmin, adminDeleteService);

export default router;
