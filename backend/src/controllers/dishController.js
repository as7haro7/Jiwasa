import Dish from "../models/Dish.js";
import Place from "../models/Place.js";

import { Sequelize } from "sequelize";
const { Op } = Sequelize;

// @desc    Obtener platos con paginación y filtros
// @route   GET /api/lugares/:lugarId/platos
// @access  Public
export const getDishes = async (req, res) => {
    try {
        const { lugarId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || "";
        const category = req.query.category || "";

        const where = { lugarId };

        if (search) {
            where[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { descripcion: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (category && category !== "Todos") {
            where.categoria = category;
        }

        const { count, rows } = await Dish.findAndCountAll({
            where,
            limit,
            offset,
            order: [["updatedAt", "DESC"]] // Most recently updated first
        });

        const dishes = rows.map(d => {
            const j = d.toJSON();
            j._id = d.id;
            return j;
        });

        res.json({
            dishes,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear un plato
// @route   POST /api/lugares/:lugarId/platos
// @access  Private
export const createDish = async (req, res) => {
    try {
        // Verify ownership of the place
        const place = await Place.findByPk(req.params.lugarId);
        if (!place) {
            return res.status(404).json({ message: "Lugar no encontrado" });
        }

        if (req.user.rol !== "admin" && place.propietarioId !== req.user.id) {
            return res.status(403).json({ message: "No autorizado para agregar platos a este lugar" });
        }

        req.body.lugarId = req.params.lugarId; // Inject parent ID

        const dish = await Dish.create(req.body);
        const json = dish.toJSON();
        json._id = dish.id;
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar plato
// @route   PUT /api/platos/:id
// @access  Private
export const updateDish = async (req, res) => {
    try {
        const dish = await Dish.findByPk(req.params.id);

        if (dish) {
            // Verify ownership via Place
            const place = await Place.findByPk(dish.lugarId);
            if (req.user.rol !== "admin" && (!place || place.propietarioId !== req.user.id)) {
                return res.status(403).json({ message: "No autorizado para editar este plato" });
            }

            await dish.update(req.body);
            const json = dish.toJSON();
            json._id = dish.id;
            res.json(json);
        } else {
            res.status(404).json({ message: "Plato no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar plato
// @route   DELETE /api/platos/:id
// @access  Private
export const deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findByPk(req.params.id);

        if (dish) {
            // Verify ownership via Place
            const place = await Place.findByPk(dish.lugarId);
            if (req.user.rol !== "admin" && (!place || place.propietarioId !== req.user.id)) {
                return res.status(403).json({ message: "No autorizado para eliminar este plato" });
            }

            await dish.destroy();
            res.json({ message: "Plato eliminado" });
        } else {
            res.status(404).json({ message: "Plato no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
