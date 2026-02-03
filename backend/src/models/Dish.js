import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Dish extends Model { }

Dish.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        lugarId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
        },
        precio: {
            type: DataTypes.FLOAT, // or DECIMAL
            allowNull: false,
        },
        categoria: {
            type: DataTypes.STRING,
        },
        foto: {
            type: DataTypes.STRING, // URL of the image
        },
        etiquetas: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        disponible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        destacado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: "Dish",
        tableName: "Dishes",
        timestamps: true,
    }
);

export default Dish;
