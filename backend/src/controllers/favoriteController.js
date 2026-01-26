import Favorite from "../models/Favorite.js";
import Place from "../models/Place.js";

// @desc    Obtener favoritos del usuario
// @route   GET /api/favoritos
// @access  Private
export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.findAll({
            where: { usuarioId: req.user.id },
            include: [{ model: Place, as: "lugar" }],
        });

        const mapped = favorites.map((f) => {
            const json = f.toJSON();
            json._id = f.id;
            if (json.lugar) {
                json.lugar._id = json.lugar.id;
            }
            return json;
        });

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Añadir a favoritos
// @route   POST /api/favoritos
// @access  Private
// Body: { "lugarId": "..." }
export const addFavorite = async (req, res) => {
    try {
        const { lugarId } = req.body;
        const usuarioId = req.user.id;

        const exists = await Favorite.findOne({ where: { usuarioId, lugarId } });
        if (exists) {
            return res.status(400).json({ message: "El lugar ya está en favoritos" });
        }

        const favorite = await Favorite.create({
            usuarioId,
            lugarId,
        });

        const json = favorite.toJSON();
        json._id = favorite.id;
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar favorito (por toggle logic usando lugarId)
// @route   DELETE /api/favoritos/lugar/:lugarId
export const removeFavoriteByPlace = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const lugarId = req.params.lugarId;

        const deleted = await Favorite.destroy({
            where: { usuarioId, lugarId },
        });

        if (deleted) {
            res.json({ message: "Eliminado de favoritos" });
        } else {
            res.status(404).json({ message: "No estaba en favoritos" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
