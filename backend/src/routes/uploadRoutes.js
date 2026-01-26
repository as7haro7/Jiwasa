import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import path from "path";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File uploads
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No se subió ningún archivo" });
    }
    // Return the path relative to the server
    // Cloudinary returns the full URL in req.file.path
    res.send({
        imageUrl: req.file.path,
        message: "Imagen subida exitosamente",
    });
});

export default router;
