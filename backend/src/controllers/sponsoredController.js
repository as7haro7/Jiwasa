import SponsoredPlacement from "../models/SponsoredPlacement.js";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

// @desc    Obtener ubicaciones patrocinadas activas (Public)
// @route   GET /api/sponsored
// @access  Public
export const getActiveSponsored = async (req, res) => {
    try {
        const now = new Date();
        const sponsored = await SponsoredPlacement.findAll({
            where: {
                activo: true,
                fechaInicio: { [Op.lte]: now },
                fechaFin: { [Op.gte]: now },
            },
            include: ["lugar"], // Assumes alias 'lugar' in association or default model name
            order: [["peso", "DESC"]],
        });

        const mapped = sponsored.map((s) => {
            const j = s.toJSON();
            j._id = s.id;
            if (j.lugar) j.lugar._id = j.lugar.id;
            return j;
        });

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear ubicación patrocinada (Admin)
// @route   POST /api/sponsored
// @access  Private/Admin
export const createSponsored = async (req, res) => {
    try {
        const { lugarId, posicion, fechaInicio, fechaFin, activo, peso } = req.body;

        const sponsored = await SponsoredPlacement.create({
            lugarId,
            posicion,
            fechaInicio,
            fechaFin,
            activo,
            peso,
        });

        const json = sponsored.toJSON();
        json._id = sponsored.id;
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener detalle de ubicación patrocinada (Admin)
// @route   GET /api/sponsored/:id
// @access  Private/Admin
export const getSponsoredById = async (req, res) => {
    try {
        const sponsored = await SponsoredPlacement.findByPk(req.params.id, {
            include: ["lugar"],
        });
        if (sponsored) {
            const json = sponsored.toJSON();
            json._id = sponsored.id;
            if (json.lugar) json.lugar._id = json.lugar.id;
            res.json(json);
        } else {
            res.status(404).json({ message: "Ubicación patrocinada no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar ubicación patrocinada (Admin)
// @route   PUT /api/sponsored/:id
// @access  Private/Admin
export const updateSponsored = async (req, res) => {
    try {
        const sponsored = await SponsoredPlacement.findByPk(req.params.id);

        if (sponsored) {
            await sponsored.update(req.body);
            const json = sponsored.toJSON();
            json._id = sponsored.id;
            res.json(json);
        } else {
            res.status(404).json({ message: "Ubicación patrocinada no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar ubicación patrocinada (Admin)
// @route   DELETE /api/sponsored/:id
// @access  Private/Admin
export const deleteSponsored = async (req, res) => {
    try {
        const sponsored = await SponsoredPlacement.findByPk(req.params.id);

        if (sponsored) {
            await sponsored.destroy();
            res.json({ message: "Ubicación patrocinada eliminada" });
        } else {
            res.status(404).json({ message: "Ubicación patrocinada no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
