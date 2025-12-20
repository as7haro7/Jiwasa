
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            // Password is not required if using Google Auth
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple nulls
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        biografia: {
            type: String,
        },
        telefono: {
            type: String,
        },
        rol: {
            type: String,
            enum: ["usuario", "admin"],
            default: "usuario",
        },
        fotoPerfil: {
            type: String,
        },
        preferenciasComida: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
