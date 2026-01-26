import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Report extends Model {}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM("lugar", "reseña"),
      allowNull: false,
    },
    lugarId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reseñaId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "resuelto", "descartado"),
      defaultValue: "pendiente",
    },
  },
  {
    sequelize,
    modelName: "Report",
    tableName: "Reports",
    timestamps: true,
  }
);

export default Report;
