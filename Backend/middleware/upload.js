import multer from "multer";
import path from "path";
import fs from "fs";

const dir = "uploads/avatars";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename:    (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.userId}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Gallery uploads are sent to Cloudinary by the controller, so they must stay
// in memory rather than being written to the avatar uploads directory.
const galleryFileFilter = (_req, file, cb) => {
    const allowedTypes = [
        "image/jpeg", "image/png", "image/webp", "image/jpg",
        "video/mp4", "video/webm", "video/quicktime",
    ];
    if (allowedTypes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only JPG, PNG, WEBP, MP4, WEBM and MOV files are allowed."));
};

export const galleryUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: galleryFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});
