
import User from "../models/User.js";

// @desc    Obtener perfil del usuario
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            biografia: user.biografia,
            telefono: user.telefono,
            fotoPerfil: user.fotoPerfil,
            preferenciasComida: user.preferenciasComida,
            authProvider: user.authProvider,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404).json({ message: "Usuario no encontrado" });
    }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Verify current password for security
        if (!req.body.currentPassword) {
             return res.status(401).json({ message: "Por favor ingresa tu contraseña actual para guardar los cambios." }); 
        }

        if (user.authProvider === "local" && !(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ message: "La contraseña actual es incorrecta." });
        }

        user.nombre = req.body.nombre || user.nombre;
        user.biografia = req.body.biografia || user.biografia;
        user.telefono = req.body.telefono || user.telefono;
        user.fotoPerfil = req.body.fotoPerfil || user.fotoPerfil;
        user.preferenciasComida = req.body.preferenciasComida || user.preferenciasComida;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
  
        res.json({
            _id: updatedUser._id,
            nombre: updatedUser.nombre,
            email: updatedUser.email,
            rol: updatedUser.rol,
            biografia: updatedUser.biografia,
            telefono: updatedUser.telefono,
            fotoPerfil: updatedUser.fotoPerfil,
            preferenciasComida: updatedUser.preferenciasComida,
            authProvider: updatedUser.authProvider,
            createdAt: updatedUser.createdAt,
            token: req.body.token,
        });
    } else {
        res.status(404).json({ message: "Usuario no encontrado" });
    }
};


