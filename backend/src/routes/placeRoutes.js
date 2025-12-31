
import express from "express";
import {
    createPlace,
    getPlaces,
    getPlaceById,
    updatePlace,
    deletePlace,
    suggestPlace,
    getMapPlaces,
    getPlacesByProximity,
} from "../controllers/placeController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

// Import other routers for nesting
import dishRoutes from "./dishRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import promotionRoutes from "./promotionRoutes.js";

const router = express.Router();

// Re-route into other resource routers
router.use("/:lugarId/platos", dishRoutes);
router.use("/:lugarId/reviews", reviewRoutes);
// Note: Reviews in req says /api/lugares/:lugarId/reseñas, so I map reviews to that path eventually or here.
// But standard is english or spanish? The req URL says /reseñas but file names are english. I'll stick to english file names, spanish URLs if needed or keep consistency.
// Req: /api/lugares/:lugarId/reseñas. I will use "resenas" or "reviews". Let's use "reviews" internally but alias the route if needed. 
// Actually, I'll just map it here to match req:
router.use("/:lugarId/resenas", reviewRoutes);
router.use("/:lugarId/promociones", promotionRoutes);


/**
 * @swagger
 * tags:
 *   name: Places
 *   description: Place management endpoints
 */

/**
 * @swagger
 * /lugares:
 *   get:
 *     summary: Get all places
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search term (name, address, food type)
 *       - in: query
 *         name: zona
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of places
 *   post:
 *     summary: Create a new place (Admin only)
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Place'
 *     responses:
 *       201:
 *         description: Place created
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /lugares/mapa:
 *   get:
 *     summary: Get lightweight place data for map
 *     tags: [Places]
 *     responses:
 *       200:
 *         description: List of places with coords
 */
router.get("/mapa", getMapPlaces);

/**
 * @swagger
 * /lugares/cercanos:
 *   get:
 *     summary: Get places nearby
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: dist
 *         schema:
 *           type: number
 *         description: Distance in km (default 1)
 *     responses:
 *       200:
 *         description: List of nearby places
 */
router.get("/cercanos", getPlacesByProximity);

/**
 * @swagger
 * /lugares:
 *   get:
 *     summary: Get all places
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search term (name, address, food type)
 *       - in: query
 *         name: zona
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of places
 *   post:
 *     summary: Create a new place (Admin only)
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Place'
 *     responses:
 *       201:
 *         description: Place created
 *       401:
 *         description: Not authorized
 */
router.route("/")
    .get(getPlaces)
    .post(protect, admin, createPlace);


/**
 * @swagger
 * /lugares/sugerencias:
 *   post:
 *     summary: Suggest a new place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Place'
 *     responses:
 *       201:
 *         description: Suggestion sent
 */
router.route("/sugerencias")
    .post(protect, suggestPlace);

/**
 * @swagger
 * /lugares/{id}:
 *   get:
 *     summary: Get place by ID
 *     tags: [Places]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Place details
 *       404:
 *         description: Place not found
 *   put:
 *     summary: Update a place (Admin only)
 *     tags: [Places]
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
 *             $ref: '#/components/schemas/Place'
 *     responses:
 *       200:
 *         description: Place updated
 *   delete:
 *     summary: Delete/Close a place (Admin only)
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Place deleted/closed
 */
router.route("/:id")
    .get(getPlaceById)
    .put(protect, admin, updatePlace)
    .delete(protect, admin, deletePlace);

export default router;
