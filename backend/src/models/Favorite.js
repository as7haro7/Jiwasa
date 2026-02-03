import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Favorite extends Model { }

Favorite.init(
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
  },
  {
    sequelize,
    modelName: "Favorite",
    tableName: "favorites",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["usuarioId", "lugarId"],
      },
    ],
  }
);

export default Favorite;
