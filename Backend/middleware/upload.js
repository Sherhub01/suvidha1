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
