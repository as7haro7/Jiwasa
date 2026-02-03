import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
// import User from "./User.js"; // Dependencies handled in db.js or via FKs

class Place extends Model { }

Place.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propietarioId: {
      type: DataTypes.UUID, // Foreign Key to User
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM(
        "callejero",
        "mercado",
        "restaurante",
        "café",
        "bar",
        "food_truck",
        "otro"
      ),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zona: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coordenadas: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    tiposComida: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    rangoPrecios: {
      type: DataTypes.ENUM("bajo", "medio", "alto"),
    },
    horario: {
      type: DataTypes.JSON, // PostGreSQL supports JSONB
      defaultValue: {},
    },
    fotos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    promedioRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    cantidadResenas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.ENUM("activo", "cerrado", "pendiente"),
      defaultValue: "activo",
    },
    destacado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    nivelVisibilidad: {
      type: DataTypes.ENUM("normal", "premium", "patrocinado"),
      defaultValue: "normal",
    },
    telefonoContacto: {
      type: DataTypes.STRING,
    },
    emailContacto: {
      type: DataTypes.STRING,
    },
    sitioWeb: {
      type: DataTypes.STRING,
    },
    redesSociales: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    metodosPago: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    servicios: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "Place",
    tableName: "places",
    timestamps: true,
  }
);

export default Place;
