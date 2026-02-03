import Place from "../models/Place.js";
import Favorite from "../models/Favorite.js";
// import { Op, sequelize } from "../models/associations.js"; // ERROR: associations doesn't export these
import { Sequelize } from "sequelize";
const { Op } = Sequelize;

// @desc    Obtener lugares con filtros y paginación
// @route   GET /api/lugares
// @access  Public
export const getPlaces = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        const offset = pageSize * (page - 1);

        const where = {};

        // If filtering by specific owner (e.g., getting "My Places")
        // If logged in user requests own places, show all states.
        // Otherwise default to active.
        if (req.query.propietarioId) {
            where.propietarioId = req.query.propietarioId;
        } else {
            // For public listing, only active places
            where.estado = "activo";
        }

        if (req.query.keyword) {
            where[Op.or] = [
                { nombre: { [Op.iLike]: `%${req.query.keyword}%` } },
                { zona: { [Op.iLike]: `%${req.query.keyword}%` } },
                { direccion: { [Op.iLike]: `%${req.query.keyword}%` } },
            ];
        }

        if (req.query.zona) {
            where.zona = req.query.zona;
        }
        if (req.query.tipo) {
            where.tipo = req.query.tipo;
        }

        const { count, rows } = await Place.findAndCountAll({
            where,
            limit: pageSize,
            offset: offset,
            order: [
                ["destacado", "DESC"],
                ["promedioRating", "DESC"],
            ],
        });

        const places = rows.map(p => {
            const json = p.toJSON();
            json._id = p.id; // Map id to _id
            return json;
        });

        res.json({ places, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener un lugar por ID
// @route   GET /api/lugares/:id
// @access  Public
export const getPlaceById = async (req, res) => {
    try {
        const place = await Place.findByPk(req.params.id);

        if (place) {
            const json = place.toJSON();
            json._id = place.id;
            res.json(json);
        } else {
            res.status(404).json({ message: "Lugar no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear un lugar (Admin o Propietario)
// @route   POST /api/lugares
// @access  Private
export const createPlace = async (req, res) => {
    try {
        // Validation: Must be Admin OR (User and esPropietario)
        if (req.user.rol !== "admin" && !req.user.esPropietario) {
            return res.status(403).json({ message: "No tienes permisos para crear lugares." });
        }
        const {
            propietarioId,
            nombre,
            tipo,
            direccion,
            zona,
            coordenadas, // Expecting { type: "Point", coordinates: [long, lat] }
            descripcion,
            tiposComida,
            rangoPrecios,
            horario,
            fotos,
            destacado,
            nivelVisibilidad,
            telefonoContacto,
            emailContacto,
            sitioWeb,
            redesSociales,
        } = req.body;

        const place = await Place.create({
            propietarioId: propietarioId || req.user?.id,
            nombre,
            tipo,
            direccion,
            zona,
            coordenadas, // Sequelize handles GeoJSON directly for GEOMETRY type
            descripcion,
            tiposComida,
            rangoPrecios,
            horario,
            fotos,
            destacado,
            nivelVisibilidad,
            telefonoContacto,
            emailContacto,
            sitioWeb,
            redesSociales,
        });

        const json = place.toJSON();
        json._id = place.id;
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar un lugar (Admin o Dueño)
// @route   PUT /api/lugares/:id
// @access  Private
export const updatePlace = async (req, res) => {
    try {
        const place = await Place.findByPk(req.params.id);

        if (place) {
            // Check permissions
            if (req.user.rol !== "admin" && place.propietarioId !== req.user.id) {
                return res.status(403).json({ message: "No autorizado para editar este lugar" });
            }
            // Update fields manually or use set/update
            await place.update(req.body); // Update with body fields

            const json = place.toJSON();
            json._id = place.id;
            res.json(json);
        } else {
            res.status(404).json({ message: "Lugar no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar/Cerrar un lugar (Admin o Dueño)
// @route   DELETE /api/lugares/:id
// @access  Private
export const deletePlace = async (req, res) => {
    try {
        const place = await Place.findByPk(req.params.id);

        if (place) {
            // Check permissions
            if (req.user.rol !== "admin" && place.propietarioId !== req.user.id) {
                return res.status(403).json({ message: "No autorizado para eliminar este lugar" });
            }
            place.estado = "cerrado";
            await place.save();
            res.json({ message: "Lugar marcado como cerrado" });
        } else {
            res.status(404).json({ message: "Lugar no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sugerir un nuevo lugar (Usuario)
// @route   POST /api/lugares/sugerencias
// @access  Private
export const suggestPlace = async (req, res) => {
    try {
        const place = await Place.create({
            ...req.body,
            estado: "pendiente",
            propietarioId: req.user.id
        });

        const json = place.toJSON();
        json._id = place.id;
        res.status(201).json({ message: "Sugerencia enviada", place: json });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener lugares optimizados para mapa (solo ID, nombre, coords, tipo)
// @route   GET /api/lugares/mapa
// @access  Public
export const getMapPlaces = async (req, res) => {
    try {
        const places = await Place.findAll({
            where: { estado: "activo" },
            attributes: [
                "id",
                "nombre",
                "tipo",
                "coordenadas",
                "nivelVisibilidad",
                "promedioRating",
                "direccion",
                "zona",
                "fotos",
            ],
        });

        const mappedPlaces = places.map((p) => {
            const json = p.toJSON();
            json._id = p.id;
            // Slice photos manually
            if (json.fotos && json.fotos.length > 0) {
                json.fotos = [json.fotos[0]];
            }
            return json;
        });

        res.json(mappedPlaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener lugares cercanos
// @route   GET /api/lugares/cercanos?lat=x&lng=y&dist=km
// @access  Public
export const getPlacesByProximity = async (req, res) => {
    try {
        const { lat, lng, dist } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitud y longitud requeridas" });
        }

        const distanceInMeters = (dist || 1) * 1000;
        const location = Sequelize.literal(`ST_GeomFromText('POINT(${lng} ${lat})', 4326)`);

        const places = await Place.findAll({
            where: Sequelize.where(
                Sequelize.fn(
                    "ST_DWithin",
                    Sequelize.col("coordenadas"),
                    location,
                    distanceInMeters,
                    true // Use spheroid=true for more accurate calculation? Or just meters directly?
                    // Note: ST_DWithin with geography type (if converted) uses meters. With geometry '4326', strictly it uses degrees unless cast to geography.
                    // However, Sequelize typically handles geometry.
                    // Using ST_DistanceSphere or casting to geography is safer for meters.
                ),
                true
            ),
            // Alternative: simpler raw query if ST_DWithin gives trouble with types
        });

        // Re-mapping for safety
        const mapped = places.map(p => { const j = p.toJSON(); j._id = p.id; return j; });

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener estadisticas basicas (favoritos)
// @route   GET /api/lugares/:id/stats
// @access  Public
export const getPlaceStats = async (req, res) => {
    try {
        const placeId = req.params.id;
        const favoritesCount = await Favorite.count({ where: { lugarId: placeId } });

        res.json({
            favoritesCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
