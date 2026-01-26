import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Default folder is 'jiwasa', but can be overridden by query param
        // Example: /api/upload?folder=perfiles -> jiwasa/perfiles
        const subfolder = req.query.folder || "general";
        return {
            folder: `jiwasa/${subfolder}`,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformations: [{ width: 1000, height: 1000, crop: "limit" }],
        };
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 } // 5MB limit
});

export default upload;
