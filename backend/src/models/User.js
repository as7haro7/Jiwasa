import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import bcrypt from "bcryptjs";

class User extends Model {
  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for Google Auth
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.ENUM("local", "google"),
      defaultValue: "local",
    },
    biografia: {
      type: DataTypes.TEXT,
    },
    telefono: {
      type: DataTypes.STRING,
    },
    rol: {
      type: DataTypes.ENUM("usuario", "admin"),
      defaultValue: "usuario",
    },
    fotoPerfil: {
      type: DataTypes.STRING,
    },
    preferenciasComida: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    esPropietario: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
