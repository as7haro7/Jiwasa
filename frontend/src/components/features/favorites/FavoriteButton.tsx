import { useState, useEffect } from "react";
import { Heart, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";

interface FavoriteButtonProps {
    placeId: string;
    className?: string;
    variant?: "icon" | "full";
}

export default function FavoriteButton({ placeId, className, variant = "icon" }: FavoriteButtonProps) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        if (user) {
            checkFavorite();
        }
    }, [user, placeId]);

    const checkFavorite = async () => {
        try {
            const { data } = await api.get("/favoritos");
            const exists = data.some((fav: any) =>
                (fav.lugarId && (fav.lugarId._id === placeId || fav.lugarId === placeId))
            );
            setIsFavorite(exists);
        } catch (error) {
            console.error("Error checking favorites", error);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (authLoading) return;

        if (!user) {
            setShowAuthModal(true);
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

    return (
        <>
            {variant === "full" ? (
                <Button
                    variant="outline"
                    onClick={toggleFavorite}
                    disabled={loading}
                    className={cn("gap-2 transition-all", isFavorite ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100" : "", className)}
                >
                    <Heart className={cn("h-5 w-5", isFavorite ? "fill-current" : "")} />
                    {isFavorite ? "Guardado" : "Guardar"}
                </Button>
            ) : (
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
            )}

            <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
                <DialogContent className="sm:max-w-md border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                    <DialogHeader className="space-y-4 flex flex-col items-center text-center pt-8">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2 animate-bounce-slow">
                            <Heart className="h-10 w-10 text-emerald-600 fill-emerald-600/20" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900">
                            ¡Guarda tus favoritos!
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 text-base max-w-xs mx-auto">
                            Únete a <span className="text-emerald-600 font-bold">JIWASA</span> para guardar este lugar y crear tu propia colección gastronómica.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-6 px-4">
                        <Button
                            onClick={() => router.push("/auth/login")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl font-bold text-base shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                        >
                            <LogIn className="mr-2 h-5 w-5" /> Iniciar Sesión
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/auth/register")}
                            className="border-zinc-200 hover:bg-zinc-50 h-12 rounded-xl font-bold text-base text-zinc-700 hover:text-zinc-900 transition-all"
                        >
                            <UserPlus className="mr-2 h-5 w-5" /> Crear cuenta gratis
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
