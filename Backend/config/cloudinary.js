import { v2 as cloudinary } from "cloudinary";

const requiredConfig = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

export const getCloudinaryConfigError = () => {
    const missing = requiredConfig.filter((key) => !process.env[key]);

    return missing.length
        ? `Cloudinary is not configured. Missing: ${missing.join(", ")}.`
        : null;
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;
