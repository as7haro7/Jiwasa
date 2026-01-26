import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class SponsoredPlacement extends Model {}

SponsoredPlacement.init(
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
        posicion: {
            type: DataTypes.ENUM("home_top", "list_result", "map_banner"),
            allowNull: false,
        },
        fechaInicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fechaFin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        peso: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                min: 1,
                max: 10,
            },
        },
    },
    {
        sequelize,
        modelName: "SponsoredPlacement",
        tableName: "SponsoredPlacements",
        timestamps: true,
        indexes: [
            {
                fields: ["activo", "fechaInicio", "fechaFin"],
            },
        ],
    }
);

export default SponsoredPlacement;
