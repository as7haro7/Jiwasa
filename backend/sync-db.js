import { sequelize } from "./src/config/db.js";
import "./src/models/associations.js"; // Ensure models are loaded

const syncDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conectado a la base de datos.");
        await sequelize.sync({ alter: true });
        console.log("Base de datos sincronizada (alter: true).");
        process.exit(0);
    } catch (error) {
        console.error("Error sincronizando base de datos:", error);
        process.exit(1);
    }
};

syncDB();
