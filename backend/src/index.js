// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import dishRoutes from "./routes/dishRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.json({ message: "API JIWASA" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lugares", placeRoutes);
app.use("/api/platos", dishRoutes);
app.use("/api/resenas", reviewRoutes);
app.use("/api/promociones", promotionRoutes);
app.use("/api/favoritos", favoriteRoutes);
app.use("/api/reportes", reportRoutes);
app.use("/api/upload", uploadRoutes);

// Static Folder for Uploads
// Go up one level from src to root, then uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
