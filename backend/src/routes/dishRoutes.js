
import express from "express";
import {
    getDishes,
    createDish,
    updateDish,
    deleteDish,
} from "../controllers/dishController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });


/**
 * @swagger
 * tags:
 *   name: Dishes
 *   description: Dish management (nested under Places)
 */

/**
 * @swagger
 * /lugares/{lugarId}/platos:
 *   get:
 *     summary: Get dishes for a place
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: lugarId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of dishes
 *   post:
 *     summary: Create a new dish for a place (Admin only)
 *     tags: [Dishes]
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
 *             $ref: '#/components/schemas/Dish'
 *     responses:
 *       201:
 *         description: Dish created
 */
router.route("/")
    .get(getDishes)
    .post(protect, createDish);


/**
 * @swagger
 * /lugares/{lugarId}/platos/{id}:
 *   put:
 *     summary: Update a dish (Admin or Owner)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lugarId
 *         required: true
 *         schema:
 *           type: string
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
 *             $ref: '#/components/schemas/Dish'
 *     responses:
 *       200:
 *         description: Dish updated
 *   delete:
 *     summary: Delete a dish (Admin or Owner)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lugarId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dish deleted
 */
router.route("/:id")
    .put(protect, updateDish)
    .delete(protect, deleteDish);

export default router;
