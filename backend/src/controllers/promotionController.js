import Promotion from "../models/Promotion.js";
import Place from "../models/Place.js";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

// @desc    Obtener promociones
// @route   GET /api/lugares/:lugarId/promociones OR /api/promociones/activas
// @access  Public
export const getPromotions = async (req, res) => {
    try {
        if (req.params.lugarId) {
            const promos = await Promotion.findAll({ where: { lugarId: req.params.lugarId } });
            res.json(promos.map(p => { const j = p.toJSON(); j._id = p.id; return j; }));
        } else {
            const today = new Date();
            const promos = await Promotion.findAll({
                where: {
                    fechaInicio: { [Op.lte]: today },
                    fechaFin: { [Op.gte]: today },
                    activa: true,
                },
            });
            res.json(promos.map(p => { const j = p.toJSON(); j._id = p.id; return j; }));
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear promoción
// @route   POST /api/lugares/:lugarId/promociones
// @access  Private/Admin
export const createPromotion = async (req, res) => {
    try {
        // Verify ownership
        const place = await Place.findByPk(req.params.lugarId);
        if (!place) return res.status(404).json({ message: "Lugar no encontrado" });

        if (req.user.rol !== "admin" && place.propietarioId !== req.user.id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        req.body.lugarId = req.params.lugarId;
        const promo = await Promotion.create(req.body);
        const json = promo.toJSON();
        json._id = promo.id;
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar promoción
// @route   PUT /api/promociones/:id
// @access  Private/Admin
export const updatePromotion = async (req, res) => {
    try {
        const promo = await Promotion.findByPk(req.params.id);
        if (promo) {
            const place = await Place.findByPk(promo.lugarId);
            if (req.user.rol !== "admin" && (!place || place.propietarioId !== req.user.id)) {
                return res.status(403).json({ message: "No autorizado" });
            }

            await promo.update(req.body);
            const json = promo.toJSON();
            json._id = promo.id;
            res.json(json);
        } else {
            res.status(404).json({ message: "Promoción no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar promoción
// @route   DELETE /api/promociones/:id
// @access  Private
export const deletePromotion = async (req, res) => {
    try {
        const promo = await Promotion.findByPk(req.params.id);
        if (promo) {
            const place = await Place.findByPk(promo.lugarId);
            if (req.user.rol !== "admin" && (!place || place.propietarioId !== req.user.id)) {
                return res.status(403).json({ message: "No autorizado" });
            }

            await promo.destroy();
            res.json({ message: "Promoción eliminada" });
        } else {
            res.status(404).json({ message: "Promoción no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
