import express from "express";
import { galleryUpload } from "../middleware/upload.js";

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
    galleryUpload.single("media"),
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
