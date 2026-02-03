
import express from "express";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "../controllers/promotionController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });


/**
 * @swagger
 * tags:
 *   name: Promotions
 *   description: Promotion management
 */

/**
 * @swagger
 * /promociones:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: List of promotions
 * 
 * /lugares/{lugarId}/promociones:
 *   post:
 *     summary: Create promotion for a place (Admin)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lugarId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descuentoPorcentaje
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precioPromo:
 *                 type: number
 *               descuentoPorcentaje:
 *                 type: number
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Promotion created
 */
router.route("/")
    .get(getPromotions)
    .post(protect, createPromotion);

router.get("/activas", getPromotions);

/**
 * @swagger
 * /promociones/{id}:
 *   put:
 *     summary: Update promotion (Admin)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Promotion updated
 */
router.route("/:id")
    .put(protect, updatePromotion)
    .delete(protect, deletePromotion);

export default router;
