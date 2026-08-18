import express from "express";
import { galleryUpload, handleUploadError } from "../middleware/upload.js";
import { uploadLimiter } from "../middleware/rateLimit.js";

import {
    uploadGalleryMedia,
    getMyGallery,
    getStaffGallery,
    deleteGalleryMedia,
    updateGalleryCaption,
} from "../controller/gallerycontroller.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyGallery);

router.get("/staff/:staffId", protect, getStaffGallery);

router.post(
    "/upload",
    protect,
    uploadLimiter,
    galleryUpload.single("media"),
    handleUploadError,
    uploadGalleryMedia
);

router.patch(
    "/:id",
    protect,
    updateGalleryCaption
);

router.delete(
    "/:id",
    protect,
    deleteGalleryMedia
);

export default router;
