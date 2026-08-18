import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOAD_ROOT   = path.join(__dirname, "..", "uploads");
export const AVATAR_DIR    = path.join(UPLOAD_ROOT, "avatars");
export const DOCUMENT_DIR  = path.join(UPLOAD_ROOT, "docs");

// Both directories must exist before multer writes to them, otherwise the
// document upload step fails with ENOENT on a fresh deployment.
for (const dir of [AVATAR_DIR, DOCUMENT_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DOC_TYPES   = [...IMAGE_TYPES, "application/pdf"];
const MEDIA_TYPES = [...IMAGE_TYPES, "video/mp4", "video/webm", "video/quicktime"];

const EXT_BY_MIME = {
    "image/jpeg": ".jpg",
    "image/jpg":  ".jpg",
    "image/png":  ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
};

// Filenames are randomised rather than derived from the user id + timestamp,
// so stored documents cannot be guessed or enumerated from outside.
const safeFilename = (file) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase().slice(0, 10);
    return `${crypto.randomBytes(16).toString("hex")}${ext}`;
};

const filterFor = (allowed, label) => (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported file type. Allowed: ${label}.`), false);
};

const diskStorage = (dir) => multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename:    (req, file, cb) => cb(null, safeFilename(file)),
});

// Profile photos — publicly served.
export const upload = multer({
    storage: diskStorage(AVATAR_DIR),
    fileFilter: filterFor(IMAGE_TYPES, "JPG, PNG, WEBP"),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

// Staff verification wizard: photo goes to avatars, identity documents go to
// the private docs directory which is never exposed by express.static.
export const staffDocumentUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) =>
            cb(null, file.fieldname === "photo" ? AVATAR_DIR : DOCUMENT_DIR),
        filename: (req, file, cb) => cb(null, safeFilename(file)),
    }),
    fileFilter: filterFor(DOC_TYPES, "JPG, PNG, WEBP, PDF"),
    limits: { fileSize: 6 * 1024 * 1024, files: 4 },
}).fields([
    { name: "photo",      maxCount: 1 },
    { name: "aadhaarDoc", maxCount: 1 },
    { name: "panDoc",     maxCount: 1 },
    { name: "certDoc",    maxCount: 1 },
]);

// Gallery uploads stream straight to Cloudinary, so they stay in memory.
export const galleryUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: filterFor(MEDIA_TYPES, "JPG, PNG, WEBP, MP4, WEBM, MOV"),
    limits: { fileSize: 50 * 1024 * 1024, files: 1 },
});

// Turns multer's errors into consistent JSON instead of a 500 HTML page.
export const handleUploadError = (err, req, res, next) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "File is too large."
            : `Upload failed: ${err.message}`;
        return res.status(400).json({ success: false, message });
    }
    if (err.message?.startsWith("Unsupported file type")) {
        return res.status(400).json({ success: false, message: err.message });
    }
    return next(err);
};
