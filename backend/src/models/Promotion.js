import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Promotion extends Model { }

Promotion.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        lugarId: {
            type: DataTypes.UUID,
            allowNull: false, // Promos usually belong to a place
        },
        platoId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        precioPromo: {
            type: DataTypes.FLOAT,
        },
        descuentoPorcentaje: {
            type: DataTypes.FLOAT,
        },
        fechaInicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fechaFin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        activa: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "Promotion",
        tableName: "promotions",
        timestamps: true,
    }
);

export default Promotion;
