"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

interface User {
    _id: string; // Or id, adapt to backend
    nombre: string;
    email: string;
    rol: string;
    fotoPerfil?: string;
    esPropietario?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // Ensure we have user data. Endpoint /users/me or similar
                    const { data } = await api.get("/users/me");
                    // Backend returns user object directly or { user: ... }? 
                    // Looking at Navbar it expects res.data. Let's assume data is the user.
                    setUser(data);
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem("token", token);
        // Fetch user immediately
        try {
            const { data } = await api.get("/users/me");
            setUser(data);
        } catch (e) {
            console.error(e);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/auth/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
