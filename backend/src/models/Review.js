import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Review extends Model { }

Review.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        usuarioId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        lugarId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comentario: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fotos: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        util: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: "Review",
        tableName: "reviews",
        timestamps: true,
    }
);

export default Review;
