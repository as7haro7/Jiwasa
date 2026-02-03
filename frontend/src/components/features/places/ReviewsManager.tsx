"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Star, MessageSquare, Heart, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Review {
    _id: string;
    rating: number;
    comentario: string;
    fotos: string[];
    createdAt: string;
    usuario: {
        _id: string;
        nombre: string;
        fotoPerfil?: string;
    };
}

interface Stats {
    favoritesCount: number;
}

interface ReviewsManagerProps {
    placeId: string;
    promedioRating: number;
    cantidadResenas: number;
}

export default function ReviewsManager({ placeId, promedioRating, cantidadResenas }: ReviewsManagerProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch reviews and stats in parallel
                const [reviewsRes, statsRes] = await Promise.all([
                    api.get(`/lugares/${placeId}/resenas`),
                    api.get(`/lugares/${placeId}/stats`)
                ]);

                setReviews(reviewsRes.data.reviews);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Error loading reviews/stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [placeId]);

    if (loading) return <div className="text-center py-8 text-zinc-400">Cargando reseñas...</div>;

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-zinc-200">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="h-6 w-6 text-amber-500 fill-current" />
                            <span className="text-3xl font-bold text-zinc-900">{promedioRating?.toFixed(1) || "0.0"}</span>
                        </div>
                        <p className="text-sm text-zinc-500">Calificación Promedio</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-zinc-200">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-6 w-6 text-blue-500" />
                            <span className="text-3xl font-bold text-zinc-900">{cantidadResenas || 0}</span>
                        </div>
                        <p className="text-sm text-zinc-500">Reseñas Totales</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-zinc-200">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-6 w-6 text-red-500 fill-current" />
                            <span className="text-3xl font-bold text-zinc-900">{stats?.favoritesCount || 0}</span>
                        </div>
                        <p className="text-sm text-zinc-500">Usuarios que aman tu lugar</p>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
                <h3 className="text-lg font-medium mb-4">Comentarios Recientes</h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 border border-dashed rounded-lg bg-zinc-50">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aún no tienes reseñas.</p>
                        <p className="text-xs mt-1">Comparte tu perfil para recibir feedback.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="border-b border-zinc-100 last:border-0 pb-6 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-3 items-center">
                                        <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center">
                                            {review.usuario?.fotoPerfil ? (
                                                <img src={review.usuario.fotoPerfil} alt={review.usuario.nombre} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-500">
                                                    {review.usuario?.nombre?.substring(0, 2).toUpperCase() || "??"}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">{review.usuario?.nombre || "Usuario Desconocido"}</h4>
                                            <div className="flex items-center text-amber-400 text-xs">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-zinc-300"}`} />
                                                ))}
                                                <span className="ml-2 text-zinc-400 text-[10px]">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-zinc-600 text-sm mt-2">{review.comentario}</p>
                                {review.fotos && review.fotos.length > 0 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                        {review.fotos.map((foto, idx) => (
                                            <img key={idx} src={foto} alt="Review attachment" className="h-20 w-20 object-cover rounded-md border border-zinc-100" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
