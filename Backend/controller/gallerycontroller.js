import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import Gallery from "../models/gallery.js";
import User from "../models/user.js";

const uploadToCloudinary = (file, folder, resourceType) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        Readable.from(file.buffer).pipe(stream);
    });
};

export const uploadGalleryMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image or video.",
            });
        }

        const user = await User.findById(req.userId).select("_id role");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        const userId = user._id;
        const role = user.role;

        if (!["consumer", "staff"].includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Invalid user role.",
            });
        }

        const isVideo = req.file.mimetype.startsWith("video/");
        const type = isVideo ? "video" : "image";

        const folder = `suvidha1/gallery/${role}/${userId}`;

        const result = await uploadToCloudinary(
            req.file,
            folder,
            isVideo ? "video" : "image"
        );

        const gallery = await Gallery.create({
            owner: userId,
            role,
            type,
            url: result.secure_url,
            publicId: result.public_id,
            caption: req.body.caption || "",
            isPublic: role === "staff",
        });

        return res.status(201).json({
            success: true,
            message: "Media uploaded successfully.",
            gallery,
        });
    } catch (error) {
        console.error("Gallery upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload media.",
        });
    }
};

export const getMyGallery = async (req, res) => {
    try {
        const gallery = await Gallery.find({
            owner: req.userId,
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            gallery,
        });
    } catch (error) {
        console.error("Get gallery error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load gallery.",
        });
    }
};

export const getStaffGallery = async (req, res) => {
    try {
        const { staffId } = req.params;

        const gallery = await Gallery.find({
            owner: staffId,
            role: "staff",
            isPublic: true,
        }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            gallery,
        });
    } catch (error) {
        console.error("Get staff gallery error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load staff gallery.",
        });
    }
};

export const deleteGalleryMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Gallery.findOne({
            _id: id,
            owner: req.userId,
        });

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Media not found.",
            });
        }

        await cloudinary.uploader.destroy(
            media.publicId,
            {
                resource_type: media.type === "video" ? "video" : "image",
            }
        );

        await media.deleteOne();

        return res.json({
            success: true,
            message: "Media deleted successfully.",
        });
    } catch (error) {
        console.error("Delete gallery error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete media.",
        });
    }
};

export const updateGalleryCaption = async (req, res) => {
    try {
        const { id } = req.params;
        const { caption } = req.body;

        const media = await Gallery.findOne({
            _id: id,
            owner: req.userId,
        });

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Media not found.",
            });
        }

        media.caption = caption?.trim() || "";
        await media.save();

        return res.json({
            success: true,
            message: "Caption updated successfully.",
            gallery: media,
        });
    } catch (error) {
        console.error("Update caption error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update caption.",
        });
    }
};
