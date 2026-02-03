"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    placeId: string;
    className?: string;
    variant?: "icon" | "full";
}

export default function FavoriteButton({ placeId, className, variant = "icon" }: FavoriteButtonProps) {
    const { user, loading: authLoading } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkFavorite();
        }
    }, [user, placeId]);

    const checkFavorite = async () => {
        try {
            const { data } = await api.get("/favoritos");
            // Check if placeId is in favorites list
            // Assuming API returns array of objects with lugarId populated or just objects
            // Step 281 shows getFavorites returning list. Let's assume it returns { lugarId: ... } or populated places.
            // If populated, we check _id. If plain, lugarId.
            const exists = data.some((fav: any) =>
                (fav.lugarId && (fav.lugarId._id === placeId || fav.lugarId === placeId))
            );
            setIsFavorite(exists);
        } catch (error) {
            console.error("Error checking favorites", error);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent linking if inside a Link
        e.stopPropagation();

        if (authLoading) return;

        if (!user) {
            alert("Inicia sesión para guardar favoritos");
            return;
        }

        setLoading(true);
        // Optimistic update
        setIsFavorite(!isFavorite);

        try {
            if (isFavorite) {
                await api.delete(`/favoritos/lugar/${placeId}`);
            } else {
                await api.post("/favoritos", { lugarId: placeId });
            }
        } catch (error) {
            console.error("Error toggling favorite", error);
            setIsFavorite(isFavorite); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    if (variant === "full") {
        return (
            <Button
                variant="outline"
                onClick={toggleFavorite}
                disabled={loading}
                className={cn("gap-2 transition-all", isFavorite ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100" : "", className)}
            >
                <Heart className={cn("h-5 w-5", isFavorite ? "fill-current" : "")} />
                {isFavorite ? "Guardado" : "Guardar"}
            </Button>
        );
    }

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading || authLoading}
            className={cn(
                "p-2 rounded-full transition-all hover:scale-110 active:scale-95",
                authLoading ? "opacity-50 animate-pulse cursor-wait" : "",
                isFavorite ? "bg-red-500 text-white shadow-md" : "bg-white/50 backdrop-blur-md text-zinc-900 hover:bg-white",
                className
            )}
        >
            <Heart className={cn("h-5 w-5", isFavorite ? "fill-current" : "")} />
        </button>
    );
}
