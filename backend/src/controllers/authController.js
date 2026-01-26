import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const user = await User.create({
            nombre,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user.id, // Map id to _id for frontend compatibility
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: "Datos de usuario inválidos" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub } = ticket.getPayload();

        let user = await User.findOne({ where: { email } });

        if (user) {
            if (!user.googleId) {
                user.googleId = sub;
                // user.authProvider = "google"; // Optional: switch provider or keep hybrid
                await user.save();
            }
        } else {
            user = await User.create({
                nombre: name,
                email,
                fotoPerfil: picture,
                googleId: sub,
                authProvider: "google",
                password: null, // Handled by pre-save check
            });
        }

        res.json({
            _id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            fotoPerfil: user.fotoPerfil,
            token: generateToken(user.id),
        });

    } catch (error) {
        res.status(400).json({ message: "Google Token inválido: " + error.message });
    }
};

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user && user.password && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: "Email o contraseña inválidos" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
