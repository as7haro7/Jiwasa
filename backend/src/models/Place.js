
import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Place:
 *       type: object
 *       required:
 *         - nombre
 *         - tipo
 *         - direccion
 *         - zona
 *         - coordenadas
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the place
 *         propietarioId:
 *           type: string
 *           description: ID of the user who owns the place
 *         nombre:
 *           type: string
 *           description: Name of the place
 *         tipo:
 *           type: string
 *           enum: [callejero, mercado, restaurante, café, otro]
 *           description: Type of establishment
 *         direccion:
 *           type: string
 *           description: Physical address
 *         zona:
 *           type: string
 *           description: Neighborhood or zone
 *         coordenadas:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               description: [longitude, latitude]
 *         descripcion:
 *           type: string
 *           description: Description of the place
 *         rangoPrecios:
 *           type: string
 *           enum: [bajo, medio, alto]
 *         horario:
 *           type: object
 *           description: Structured weekly schedule
 *         fotos:
 *           type: array
 *           items:
 *             type: string
 *           description: List of photo URLs
 *         promedioRating:
 *           type: number
 *           description: Average rating
 *         cantidadResenas:
 *           type: number
 *           description: Total number of reviews
 *         estado:
 *           type: string
 *           enum: [activo, cerrado, pendiente]
 *         destacado:
 *           type: boolean
 *           default: false
 *         nivelVisibilidad:
 *           type: string
 *           enum: [normal, premium, patrocinado]
 *         telefonoContacto:
 *           type: string
 *         emailContacto:
 *           type: string
 *         sitioWeb:
 *           type: string
 *         redesSociales:
 *           type: object
 *           description: Social media links
 *       example:
 *         nombre: Salteñería Paceña
 *         tipo: restaurante
 *         zona: Centro
 *         estado: activo
 */

const placeSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        propietarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // Assuming a place must have an owner
        },
        tipo: {
            type: String,
            enum: ["callejero", "mercado", "restaurante", "café", "bar", "food_truck", "otro"],
            required: true,
        },
        direccion: {
            type: String,
            required: true,
        },
        zona: {
            type: String,
            required: true,
            // Examples: "Centro", "Sopocachi", "Miraflores", etc.
        },
        coordenadas: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        descripcion: {
            type: String,
        },
        tiposComida: [
            {
                type: String,
            },
        ],
        rangoPrecios: {
            type: String,
            enum: ["bajo", "medio", "alto"],
        },
        horario: {
            lunes: { apertura: String, cierre: String, cerrado: Boolean },
            martes: { apertura: String, cierre: String, cerrado: Boolean },
            miercoles: { apertura: String, cierre: String, cerrado: Boolean },
            jueves: { apertura: String, cierre: String, cerrado: Boolean },
            viernes: { apertura: String, cierre: String, cerrado: Boolean },
            sabado: { apertura: String, cierre: String, cerrado: Boolean },
            domingo: { apertura: String, cierre: String, cerrado: Boolean },
        },
        fotos: [
            {
                type: String,
            },
        ],
        promedioRating: {
            type: Number,
            default: 0,
        },
        cantidadResenas: {
            type: Number,
            default: 0,
        },
        estado: {
            type: String,
            enum: ["activo", "cerrado", "pendiente"],
            default: "activo",
        },
        destacado: {
            type: Boolean,
            default: false,
        },
        nivelVisibilidad: {
            type: String,
            enum: ["normal", "premium", "patrocinado"],
            default: "normal",
        },
        telefonoContacto: {
            type: String,
        },
        emailContacto: {
            type: String,
        },
        sitioWeb: {
            type: String,
        },
        redesSociales: {
            facebook: String,
            instagram: String,
            tiktok: String,
            otra: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for geospatial queries
placeSchema.index({ coordenadas: "2dsphere" });

const Place = mongoose.model("Place", placeSchema);

export default Place;
