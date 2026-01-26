import Report from "../models/Report.js";
import User from "../models/User.js";

// @desc    Crear reporte
// @route   POST /api/reportes
// @access  Private
export const createReport = async (req, res) => {
    try {
        const { tipo, lugarId, reseñaId, motivo } = req.body;
        const usuarioId = req.user.id;

        const report = await Report.create({
            tipo,
            lugarId,
            reseñaId,
            usuarioId,
            motivo,
        });

        const json = report.toJSON();
        json._id = report.id;
        res.status(201).json(json);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener reportes (Admin)
// @route   GET /api/reportes
// @access  Private/Admin
export const getReports = async (req, res) => {
    try {
        const reports = await Report.findAll({
            include: [
                {
                    model: User,
                    as: "usuario",
                    attributes: ["nombre", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const mapped = reports.map((r) => {
            const j = r.toJSON();
            j._id = r.id;
            if (j.usuario) j.usuario._id = j.usuario.id;
            return j;
        });

        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar estado reporte (Admin)
// @route   PUT /api/reportes/:id
// @access  Private/Admin
export const updateReportStatus = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (report) {
            report.estado = req.body.estado || report.estado;
            const updatedReport = await report.save();
            const json = updatedReport.toJSON();
            json._id = updatedReport.id;
            res.json(json);
        } else {
            res.status(404).json({ message: "Reporte no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
