import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import path from "path";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No se subió ningún archivo" });
    }
    // Return the path relative to the server
    // Assuming we serve 'uploads' folder dynamically
    res.send({
        imageUrl: `uploads/${req.file.filename}`,
        message: "Imagen subida exitosamente",
    });
});

export default router;
