"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Star, MapPin, Clock, ArrowLeft, Heart, Share2, MessageSquare, Tag, Phone, Globe, Facebook, Instagram, Utensils } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";

import FavoriteButton from "@/components/features/favorites/FavoriteButton";

// Dynamic Map
const Map = dynamic(() => import("@/components/features/Map"), {
    loading: () => <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center text-zinc-400">Cargando mapa...</div>,
    ssr: false
});

interface Review {
    _id: string;
    usuarioId: { nombre: string; _id: string; fotoPerfil?: string };
    rating: number;
    comentario: string;
    createdAt: string;
}

interface Promotion {
    _id: string;
    titulo: string;
    descripcion: string;
    descuentoPorcentaje: number;
    fechaFin: string;
    platoId?: string;
}

interface Dish {
    _id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    disponible: boolean;
    etiquetas: string[];
    foto?: string;
}

interface Place {
    _id: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    zona: string;
    direccion: string;
    horario: any; // Simplified for now
    precio: string;
    fotos: string[];
    promedioRating: number;
    // Menu removed from place object as it's fetched separately now
    coordenadas: {
        coordinates: [number, number];
    };
    telefonoContacto?: string;
    emailContacto?: string;
    sitioWeb?: string;
    redesSociales?: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
        otra?: string;
    };
    tiposComida?: string[];
    rangoPrecios?: 'bajo' | 'medio' | 'alto';
    estado?: 'activo' | 'cerrado' | 'pendiente';
    cantidadResenas?: number;
}

export default function PlaceDetailPage() {
    const params = useParams();
    const [place, setPlace] = useState<Place | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Review Form
    const [newReview, setNewReview] = useState({ rating: 5, comentario: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!params.id) return;
                const [placeRes, reviewsRes, promosRes, dishesRes] = await Promise.all([
                    api.get(`/lugares/${params.id}`),
                    api.get(`/lugares/${params.id}/resenas`),
                    api.get(`/lugares/${params.id}/promociones`),
                    api.get(`/lugares/${params.id}/platos`)
                ]);

                setPlace(placeRes.data);
                setReviews(reviewsRes.data.reviews || []); // Extract reviews array from paginated response
                setPromotions(promosRes.data);

                // Handle dish response (new paginated format)
                const dishesData = dishesRes.data;
                if (Array.isArray(dishesData)) {
                    setDishes(dishesData);
                } else {
                    setDishes(dishesData.dishes || []);
                }
            } catch (err) {
                console.error("Error fetching place data:", err);
                setError("No se pudo cargar la información completa.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            // Assuming user is authenticated and token is in interceptor
            await api.post(`/lugares/${params.id}/resenas`, newReview);
            // Refresh reviews
            const res = await api.get(`/lugares/${params.id}/resenas`);
            setReviews(res.data.reviews || []); // Extract reviews array
            setNewReview({ rating: 5, comentario: "" });
        } catch (error) {
            console.error("Error posting review", error);
            alert("Error al publicar reseña. ¿Estás logueado?");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error || !place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-xl font-bold mb-4">Error</h1>
                <p className="text-zinc-600 mb-6">{error || "Lugar no encontrado"}</p>
                <Link href="/">
                    <Button>Volver al inicio</Button>
                </Link>
            </div>
        );
    }

    // Format schedule text safely
    const formatSchedule = (horario: any) => {
        if (typeof horario === 'string') return horario;
        if (!horario) return "Horario no disponible";
        return "Consultar horario detallado";
    };

    // Helper to check if open now
    const isPlaceOpenNow = () => {
        if (!place || !place.horario || typeof place.horario !== 'object') return false;
        if (place.estado !== 'activo') return false;

        const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const now = new Date();
        const currentDay = days[now.getDay()];
        const schedule = place.horario[currentDay];

        if (!schedule || schedule.cerrado) return false;

        try {
            // Normalize to minutes for easy comparison
            const currentTime = now.getHours() * 60 + now.getMinutes();

            if (!schedule.apertura || !schedule.cierre) return false;

            const [openH, openM] = schedule.apertura.split(':').map(Number);
            const [closeH, closeM] = schedule.cierre.split(':').map(Number);

            const openTime = openH * 60 + openM;
            const closeTime = closeH * 60 + closeM;

            // Handle late night closing (e.g. 18:00 - 02:00)
            if (closeTime < openTime) {
                return currentTime >= openTime || currentTime < closeTime;
            }

            return currentTime >= openTime && currentTime < closeTime;
        } catch (e) {
            console.error("Error parsing time for schedule", e);
            return false;
        }
    };

    const isOpen = isPlaceOpenNow();

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            {/* Immersive Header Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-zinc-900">
                {place.fotos && place.fotos.length > 0 ? (
                    <>
                        <Image
                            src={place.fotos[0]}
                            alt={place.nombre}
                            fill
                            className="object-cover opacity-90"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500 bg-zinc-800">
                        <span className="text-zinc-400 font-medium">Sin fotografía disponible</span>
                    </div>
                )}

                {/* Navigation & Actions */}
                <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center z-20">
                    <Link href="/">
                        <Button variant="ghost" className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full p-2.5 h-auto border border-white/10 transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full p-2.5 h-auto border border-white/10 transition-all">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <FavoriteButton
                            placeId={place._id}
                            className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white hover:bg-black/60 rounded-full p-2.5 h-auto border border-white/10 transition-all"
                        />
                    </div>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-12 z-20">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                                {place.tipo}
                            </span>
                            <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-md px-2 py-1 rounded-full border border-yellow-400/30">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-white font-bold text-xs">{place.promedioRating ? place.promedioRating.toFixed(1) : "Nuevo"}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight shadow-sm leading-tight">
                            {place.nombre}
                        </h1>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-zinc-300 text-sm md:text-base font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-emerald-400" />
                                <span>{place.direccion}, {place.zona}</span>
                            </div>
                            {/* Schedule removed */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-8 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Promotions Banner */}
                        {promotions.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-zinc-100 relative overflow-hidden">

                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="p-2 bg-orange-100/50 rounded-lg">
                                        <Tag className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl text-zinc-900 leading-none">Ofertas Especiales</h3>
                                        <p className="text-zinc-500 text-sm mt-1">Aprovecha estos descuentos por tiempo limitado</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                                    {promotions.map(promo => {
                                        const promoDish = dishes.find(d => d._id === promo.platoId);
                                        return (
                                            <div key={promo._id} className="relative group overflow-hidden rounded-2xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/20">
                                                {/* Vibrant Gradient Background */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />

                                                {/* Decorative Circles */}
                                                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-colors" />
                                                <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-black/5 blur-xl group-hover:bg-black/10 transition-colors" />

                                                <div className="relative p-5 text-white h-full flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                                                Cupón
                                                            </span>
                                                            <div className="flex items-baseline bg-white/90 text-red-600 px-2 py-1 rounded-lg shadow-sm">
                                                                <span className="font-black text-lg leading-none">-{promo.descuentoPorcentaje}</span>
                                                                <span className="text-[10px] font-bold ml-0.5">%</span>
                                                            </div>
                                                        </div>

                                                        <h4 className="font-bold text-xl mb-1 text-white shadow-sm">{promo.titulo}</h4>
                                                        <p className="text-orange-50 text-xs font-medium mb-4 leading-relaxed opacity-90 line-clamp-2">{promo.descripcion}</p>

                                                        {/* Linked Dish Info */}
                                                        {promoDish && (
                                                            <div className="bg-black/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 mb-2">
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-orange-200 uppercase font-bold mb-0.5">Incluye</span>
                                                                        <span className="text-sm font-bold text-white truncate max-w-[120px]">{promoDish.nombre}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-[10px] text-orange-200 line-through decoration-orange-200/60">Bs {promoDish.precio}</div>
                                                                        <div className="text-base font-bold text-white">
                                                                            Bs {(promoDish.precio * (1 - promo.descuentoPorcentaje / 100)).toFixed(1)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-orange-100 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Vence: {new Date(promo.fechaFin).toLocaleDateString()}
                                                        </span>
                                                        <span className="bg-white text-orange-600 px-2 py-1 rounded-md font-bold text-[10px] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all cursor-pointer shadow-sm">
                                                            Reclamar
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <section className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-2xl font-bold mb-4 text-zinc-900">Nuestra Historia</h2>
                            <p className="text-zinc-600 leading-relaxed text-lg">
                                {place.descripcion || "Este lugar aún no ha añadido una descripción detallada, pero te invitamos a visitarlo y descubrir sus sabores por ti mismo."}
                            </p>
                        </section>

                        {/* Menu */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-zinc-900">Menú Destacado</h2>
                                <Button variant="outline" className="text-xs h-8 rounded-full" onClick={() => setIsMenuOpen(true)}>Ver menú completo</Button>
                            </div>
                            {dishes && dishes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dishes.map((item) => (
                                        <div key={item._id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group cursor-default relative overflow-hidden flex gap-4">
                                            {!item.disponible && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]"><span className="bg-zinc-800 text-white text-xs px-2 py-1 rounded font-bold">Agotado</span></div>}

                                            {item.foto && (
                                                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
                                                    <Image
                                                        src={item.foto}
                                                        alt={item.nombre}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1 flex flex-col h-full">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <div>
                                                        <h3 className="font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{item.nombre}</h3>
                                                        {item.categoria && <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-50 px-1.5 rounded border border-zinc-100 inline-block mt-0.5">{item.categoria}</span>}
                                                    </div>
                                                    <span className="font-bold text-zinc-900 text-sm whitespace-nowrap">
                                                        Bs {item.precio}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-auto">{item.descripcion}</p>
                                                {item.etiquetas && item.etiquetas.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {item.etiquetas.slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">#{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-zinc-50 rounded-2xl p-8 text-center border-2 border-dashed border-zinc-200">
                                    <Utensils className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                                    <p className="text-zinc-500 font-medium">No hay platos registrados aún.</p>
                                    <p className="text-xs text-zinc-400 mt-1">El menú se actualizará pronto.</p>
                                </div>
                            )}
                        </section>

                        {/* Reviews */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <MessageSquare className="h-6 w-6 text-emerald-600" />
                                    Reseñas de la comunidad
                                </h2>
                            </div>

                            <div className="grid gap-6">
                                {/* Write Review Card */}
                                <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 text-zinc-900">¿Estuviste aquí? Comparte tu experiencia</h3>
                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Tu calificación</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                                        className={`p-1 rounded-full focus:outline-none transition-all hover:scale-110 ${newReview.rating >= star ? "text-yellow-400" : "text-zinc-200"}`}
                                                    >
                                                        <Star className="h-8 w-8 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Cuéntanos qué te pareció la comida, el ambiente..."
                                                className="bg-zinc-50 border-zinc-200 focus:border-zinc-400 min-h-[120px] rounded-xl text-base p-4 resize-none"
                                                value={newReview.comentario}
                                                onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                                                required
                                            />
                                            <div className="absolute bottom-3 right-3">
                                                <Button size="sm" type="submit" disabled={submittingReview} className="rounded-full px-6 bg-black text-white hover:bg-zinc-800">
                                                    {submittingReview ? "..." : "Publicar"}
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </div>



                                {/* Reviews List */}
                                {reviews.length > 0 ? (
                                    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm divide-y divide-zinc-100">
                                        {reviews.map(review => (
                                            <div key={review._id} className="p-6 md:p-8 hover:bg-zinc-50/50 transition-colors first:rounded-t-3xl last:rounded-b-3xl">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden relative">
                                                            {/* Use usuarioId for user data */}
                                                            {review.usuarioId?.fotoPerfil ? (
                                                                <Image
                                                                    src={review.usuarioId.fotoPerfil}
                                                                    alt={review.usuarioId.nombre || "User"}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <span>{review.usuarioId?.nombre?.substring(0, 2).toUpperCase() || "J"}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-zinc-900 block leading-tight">{review.usuarioId?.nombre || "Jiwasa User"}</span>
                                                            <span className="text-xs text-zinc-400 font-medium">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-zinc-300 opacity-50'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-zinc-600 leading-relaxed pl-[52px]">{review.comentario}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200">
                                        <MessageSquare className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
                                        <p className="text-zinc-400 font-medium">Sé el primero en opinar sobre {place.nombre}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>

                    {/* Sidebar (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Key Details & Contact Card */}
                            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                                <h3 className="font-bold text-zinc-900 mb-4 text-sm uppercase tracking-wide">Información</h3>

                                <div className="flex flex-wrap gap-3 mb-6">
                                    {/* Price Range */}
                                    {place.rangoPrecios && (
                                        <div className="flex items-center gap-1 bg-zinc-100 px-4 py-1.5 rounded-full" title="Rango de Precios">
                                            <span className="text-zinc-600 font-medium text-xs uppercase tracking-wide">Precio:</span>
                                            <span className="text-sm font-bold text-zinc-900">
                                                {place.rangoPrecios === 'bajo' && 'Económico (Bs)'}
                                                {place.rangoPrecios === 'medio' && 'Moderado (Bs)'}
                                                {place.rangoPrecios === 'alto' && 'Elevado (Bs)'}
                                            </span>
                                        </div>
                                    )}

                                    {/* State Badge */}
                                    {/* State Badge */}
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border flex items-center gap-2 ${isOpen ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                        <span className={`h-2 w-2 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
                                        {isOpen ? 'ABIERTO AHORA' : 'CERRADO'}
                                    </span>
                                </div>

                                {/* Schedule (Brief) */}
                                {place.horario && (
                                    <div className="mb-6 pb-6 border-b border-zinc-50">
                                        <h4 className="font-bold text-zinc-900 mb-2 text-xs flex items-center gap-2 uppercase tracking-wide">
                                            <Clock className="h-3 w-3 text-emerald-600" /> Horarios
                                        </h4>
                                        <div className="space-y-1.5">
                                            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(dia => {
                                                const info = place.horario?.[dia];
                                                if (!info) return null;
                                                return (
                                                    <div key={dia} className="flex justify-between text-xs">
                                                        <span className="capitalize text-zinc-500 w-24">{dia}</span>
                                                        <span className="font-medium text-zinc-900">
                                                            {info.cerrado ? <span className="text-red-400">Cerrado</span> : `${info.apertura} - ${info.cierre}`}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="space-y-3">
                                    {place.telefonoContacto && (
                                        <a
                                            href={`https://wa.me/${place.telefonoContacto.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 text-sm group cursor-pointer hover:bg-emerald-50 p-2 rounded-lg -mx-2 transition-colors border border-transparent hover:border-emerald-100"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-zinc-800 block">{place.telefonoContacto.replace(/^\+591/, '').trim()}</span>
                                                <span className="text-[10px] text-emerald-600 font-medium">Contactar por WhatsApp</span>
                                            </div>
                                        </a>
                                    )}
                                    {place.sitioWeb && (
                                        <Link href={place.sitioWeb.startsWith('http') ? place.sitioWeb : `https://${place.sitioWeb}`} target="_blank" className="flex items-center gap-3 text-sm group cursor-pointer hover:bg-zinc-50 p-2 rounded-lg -mx-2 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                <Globe className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-zinc-700 truncate max-w-[180px]">{place.sitioWeb}</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Social Media */}
                                {place.redesSociales && (place.redesSociales.facebook || place.redesSociales.instagram || place.redesSociales.tiktok) && (
                                    <div className="mt-6 pt-6 border-t border-zinc-100">
                                        <h4 className="font-bold text-zinc-900 mb-3 text-xs uppercase tracking-wide">Síguenos</h4>
                                        <div className="flex gap-2">
                                            {place.redesSociales.facebook && (
                                                <a href={place.redesSociales.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1877F215] flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all">
                                                    <Facebook className="h-5 w-5" />
                                                </a>
                                            )}
                                            {place.redesSociales.instagram && (
                                                <a href={place.redesSociales.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#E4405F15] flex items-center justify-center text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all">
                                                    <Instagram className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Food Tags */}
                                {place.tiposComida && place.tiposComida.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-wrap gap-2">
                                        {place.tiposComida.map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md uppercase tracking-wider font-bold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Location Card */}
                            <div className="bg-white p-2 rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-white mb-1">
                                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-600" /> Ubicación
                                    </h3>
                                </div>
                                <div className="aspect-square w-full rounded-2xl overflow-hidden relative border border-zinc-100">
                                    {/* Ensure Map takes full height of container */}
                                    <div className="h-full w-full">
                                        <Map places={[place]} />
                                    </div>
                                </div>
                                <div className="p-2 mt-1">
                                    <Button variant="ghost" className="w-full text-xs font-bold text-zinc-600 hover:bg-zinc-50 h-10 rounded-xl" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.coordenadas.coordinates[1]},${place.coordenadas.coordinates[0]}`, '_blank')}>
                                        Abrir en Google Maps <ArrowLeft className="h-3 w-3 ml-2 rotate-180" />
                                    </Button>
                                </div>
                            </div>

                            {/* Share Card */}
                            <div className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-3xl shadow-lg text-white">
                                <h3 className="font-bold text-lg mb-2">¿Te gustó este lugar?</h3>
                                <p className="text-zinc-400 text-sm mb-4">Compártelo con tus amigos y planeen su próxima salida.</p>
                                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-xl h-10">
                                    Copiar enlace
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Full Menu Modal */}
            <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col bg-white">
                    <DialogHeader className="border-b border-zinc-100 pb-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-zinc-900">
                            <Utensils className="h-6 w-6 text-emerald-600" /> Menú Completo - {place?.nombre}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto p-1 pr-4 -mr-4 flex-1">
                        {dishes.length === 0 ? (
                            <div className="text-center py-20 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 mt-4">
                                <Utensils className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                                <p>No hay platos registrados aún.</p>
                            </div>
                        ) : (
                            <div className="space-y-8 py-4">
                                {Object.entries(dishes.reduce((acc, dish) => {
                                    const cat = dish.categoria || 'Variados';
                                    if (!acc[cat]) acc[cat] = [];
                                    acc[cat].push(dish);
                                    return acc;
                                }, {} as Record<string, Dish[]>)).map(([category, items]) => (
                                    <div key={category}>
                                        <h4 className="font-bold text-lg text-emerald-800 mb-4 flex items-center gap-2 sticky top-0 bg-white z-10 py-2 border-b border-emerald-100">
                                            <span className="w-2 h-8 rounded-full bg-emerald-500"></span>
                                            <span className="capitalize">{category}</span>
                                            <span className="text-xs text-zinc-400 font-normal ml-auto">{items.length} platos</span>
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map(item => (
                                                <div key={item._id} className="flex gap-4 p-4 rounded-xl border border-zinc-100 hover:border-emerald-200 hover:shadow-md transition-all bg-white group hover:scale-[1.01] relative overflow-hidden">
                                                    {item.foto && (
                                                        <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                                                            <Image
                                                                src={item.foto}
                                                                alt={item.nombre}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-zinc-900 text-lg">{item.nombre}</span>
                                                                    {!item.disponible && <span className="text-[10px] bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Agotado</span>}
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-emerald-700 whitespace-nowrap text-lg">Bs {item.precio}</span>
                                                        </div>
                                                        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{item.descripcion}</p>
                                                        {item.etiquetas && item.etiquetas.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {item.etiquetas.map((tag, i) => (
                                                                    <span key={i} className="text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">#{tag}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
