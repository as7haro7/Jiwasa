import Review from "../models/Review.js";
import Place from "../models/Place.js";
import User from "../models/User.js";

// @desc    Obtener reseñas de un lugar
// @route   GET /api/lugares/:lugarId/resenas
// @access  Public
export const getReviews = async (req, res) => {
    try {
        const pageSize = 5;
        const page = Number(req.query.pageNumber) || 1;
        const offset = pageSize * (page - 1);

        const { count, rows } = await Review.findAndCountAll({
            where: { lugarId: req.params.lugarId },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "usuario",
                    attributes: ["nombre", "fotoPerfil"],
                },
            ],
            limit: pageSize,
            offset: offset,
        });

        const reviews = rows.map((r) => {
            const json = r.toJSON();
            json._id = r.id;
            if (json.usuario) json.usuario._id = json.usuario.id;
            return json;
        });

        res.json({ reviews, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear reseña
// @route   POST /api/lugares/:lugarId/resenas
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { rating, comentario, fotos } = req.body;
        const lugarId = req.params.lugarId;
        const usuarioId = req.user.id;

        const alreadyReviewed = await Review.findOne({
            where: { lugarId, usuarioId },
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: "Ya escribiste una reseña para este lugar" });
        }

        const review = await Review.create({
            lugarId,
            usuarioId,
            rating: Number(rating),
            comentario,
            fotos,
        });

        // Recalculate Place stats
        const allReviews = await Review.findAll({ where: { lugarId } });
        const cantidadResenas = allReviews.length;
        const sumRating = allReviews.reduce((acc, item) => item.rating + acc, 0);
        const promedioRating = sumRating / cantidadResenas;

        const place = await Place.findByPk(lugarId);
        if (place) {
            place.cantidadResenas = cantidadResenas;
            place.promedioRating = promedioRating;
            await place.save();
        }

        const json = review.toJSON();
        json._id = review.id;
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Marcar como útil
// @route   POST /api/resenas/:id/util
// @access  Private
export const markReviewHelpful = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (review) {
            review.util = (review.util || 0) + 1;
            await review.save();
            res.json({ message: "Reseña marcada como útil", util: review.util });
        } else {
            res.status(404).json({ message: "Reseña no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
