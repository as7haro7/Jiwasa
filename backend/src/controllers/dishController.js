import Dish from "../models/Dish.js";

// @desc    Obtener platos (de un lugar específico o todos - aunque todos no es común sin filtros)
// @route   GET /api/lugares/:lugarId/platos
// @access  Public
export const getDishes = async (req, res) => {
    try {
        if (req.params.lugarId) {
            const dishes = await Dish.findAll({ where: { lugarId: req.params.lugarId } });
            res.json(dishes.map(d => { const j = d.toJSON(); j._id = d.id; return j; }));
        } else {
            // Si se quisiera listar todos los platos, cuidado con performance
            res.status(400).json({ message: "Falta ID de lugar" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear un plato
// @route   POST /api/lugares/:lugarId/platos
// @access  Private/Admin
export const createDish = async (req, res) => {
    try {
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
// @access  Private/Admin
export const updateDish = async (req, res) => {
    try {
        const dish = await Dish.findByPk(req.params.id);

        if (dish) {
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
// @access  Private/Admin
export const deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findByPk(req.params.id);

        if (dish) {
            await dish.destroy();
            res.json({ message: "Plato eliminado" });
        } else {
            res.status(404).json({ message: "Plato no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
