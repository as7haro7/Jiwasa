
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ["password"] },
            });

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "No autorizado, token fallido" });
        }
    } else {
        return res.status(401).json({ message: "No autorizado, no hay token" });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.rol === "admin") {
        next();
    } else {
        res.status(401).json({ message: "No autorizado como administrador" });
    }
};
