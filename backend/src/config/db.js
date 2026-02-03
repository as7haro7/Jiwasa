import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    })
    : new Sequelize(
        process.env.DB_NAME || "jiwasa",
        process.env.DB_USER || "postgres",
        process.env.DB_PASS || "postgres",
        {
            host: process.env.DB_HOST || "localhost",
            dialect: "postgres",
            logging: false,
            dialectOptions: process.env.NODE_ENV === "production" ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            } : {}
        }
    );

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        const connectionType = process.env.DATABASE_URL ? "Neon (Cloud)" : "Local (PostgreSQL)";
        console.log(`PostgreSQL conectado: ${connectionType}`);
        // Sync models
        // Sync models
        // await sequelize.sync({ alter: true });
    } catch (error) {
        console.error("Error conectando a PostgreSQL", error);
        process.exit(1);
    }
};
