"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Star, MapPin, Clock, ArrowLeft, Heart, Share2, MessageSquare, Tag, Phone, Globe, Facebook, Instagram, Utensils, ChevronRight, Check, ChevronLeft, X, ArrowRight, Search, Wifi, CreditCard, DollarSign, Camera } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger // Ensure this is imported if used, otherwise remove
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

import FavoriteButton from "@/components/features/favorites/FavoriteButton";

// Dynamic Map
const Map = dynamic(() => import("@/components/features/Map"), {
    loading: () => <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center text-zinc-400">Cargando mapa...</div>,
    ssr: false
});

// Interfaces
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
    horario: any;
    precio: string;
    fotos: string[];
    promedioRating: number;
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
        [key: string]: string | undefined;
    };
    tiposComida?: string[];
    metodosPago?: string[];
    servicios?: string[];
    rangoPrecios?: 'bajo' | 'medio' | 'alto';
    estado?: 'activo' | 'cerrado' | 'pendiente';
    cantidadResenas?: number;
}

export default function PlaceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [place, setPlace] = useState<Place | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // Add search state

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Enlace copiado", {
            description: "El link del lugar ha sido copiado al portapapeles",
            icon: <Share2 className="h-4 w-4" />,
            duration: 3000,
            className: "bg-emerald-50 border-emerald-100 text-emerald-800"
        });
    };

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Review Form
    const [newReview, setNewReview] = useState({ rating: 5, comentario: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Menu Modal Category Selection
    const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>("Todos");


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
                setReviews(reviewsRes.data.reviews || []);
                setPromotions(promosRes.data);

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

    // Carousel Autoplay
    useEffect(() => {
        if (!place || !place.fotos || place.fotos.length <= 1) return;

        startCarousel();
        return () => stopCarousel();
    }, [place, currentImageIndex]); // Depend on currentImageIndex to reset timer on manual change if needed, but simple interval is safer

    const startCarousel = () => {
        if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = setInterval(() => {
            setCurrentImageIndex(prev => (place && place.fotos ? (prev + 1) % place.fotos.length : 0));
        }, 5000);
    };

    const stopCarousel = () => {
        if (carouselIntervalRef.current) {
            clearInterval(carouselIntervalRef.current);
            carouselIntervalRef.current = null;
        }
    };

    const nextImage = () => {
        if (!place?.fotos) return;
        setCurrentImageIndex((prev) => (prev + 1) % place.fotos.length);
        stopCarousel();
        startCarousel();
    };

    const prevImage = () => {
        if (!place?.fotos) return;
        setCurrentImageIndex((prev) => (prev - 1 + place.fotos.length) % place.fotos.length);
        stopCarousel();
        startCarousel();
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await api.post(`/lugares/${params.id}/resenas`, newReview);
            const res = await api.get(`/lugares/${params.id}/resenas`);
            setReviews(res.data.reviews || []);
            setNewReview({ rating: 5, comentario: "" });
        } catch (error) {
            console.error("Error posting review", error);
            alert("Error al publicar reseña. ¿Estás logueado?");
        } finally {
            setSubmittingReview(false);
        }
    };

    const isPlaceOpenNow = () => {
        if (!place || !place.horario || typeof place.horario !== 'object') return false;
        if (place.estado !== 'activo') return false;

        const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const now = new Date();
        const currentDay = days[now.getDay()];
        const schedule = place.horario[currentDay];

        if (!schedule || schedule.cerrado) return false;

        try {
            const currentTime = now.getHours() * 60 + now.getMinutes();
            if (!schedule.apertura || !schedule.cierre) return false;
            const [openH, openM] = schedule.apertura.split(':').map(Number);
            const [closeH, closeM] = schedule.cierre.split(':').map(Number);
            const openTime = openH * 60 + openM;
            const closeTime = closeH * 60 + closeM;

            if (closeTime < openTime) {
                return currentTime >= openTime || currentTime < closeTime;
            }
            return currentTime >= openTime && currentTime < closeTime;
        } catch (e) { return false; }
    };

    // Derived State for Menu
    const menuCategories = dishes.reduce((acc, dish) => {
        const cat = dish.categoria || 'Otros';
        if (!acc.includes(cat)) acc.push(cat);
        return acc;
    }, ['Todos'] as string[]);

    const filteredDishes = dishes.filter(d => {
        const matchesCategory = selectedMenuCategory === 'Todos' || (d.categoria || 'Otros') === selectedMenuCategory;
        const matchesSearch = d.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.descripcion && d.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div></div>;
    if (error || !place) return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-400">Error: {error}</div>;

    const isOpen = isPlaceOpenNow();

    return (
        <div className="min-h-screen bg-zinc-50 font-sans pb-24">

            {/* HERO SECTION WITH CAROUSEL */}
            <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden group">
                {place.fotos && place.fotos.length > 0 ? (
                    <>
                        {place.fotos.map((foto, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                                )}
                            >
                                <Image
                                    src={foto}
                                    alt={`${place.nombre} - foto ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                                {/* Improved Dark Gradient for Readability */}
                                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                                <div className="absolute inset-0 bg-black/20" /> {/* General dimming */}
                            </div>
                        ))}

                        {/* Carousel Controls */}
                        {place.fotos.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>

                                {/* Indicators */}
                                <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 flex justify-center gap-2 z-30">
                                    {place.fotos.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setCurrentImageIndex(idx); stopCarousel(); startCarousel(); }}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                                                idx === currentImageIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                    </>
                ) : (
                    <div className="absolute inset-0 bg-zinc-900" />
                )}

                {/* Navbar Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                    <Button onClick={() => router.back()} variant="ghost" className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full h-12 w-12 p-0 border border-white/10 transition-all flex items-center justify-center">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex gap-3">
                        <Button onClick={handleShare} variant="ghost" className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full h-12 w-12 p-0 border border-white/10 transition-all flex items-center justify-center">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <FavoriteButton placeId={place._id} className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full h-12 w-12 p-0 border border-white/10 transition-all flex items-center justify-center" />
                    </div>
                </div>

                {/* Hero Info - Floating Card Style */}
                <div className="absolute bottom-12 md:bottom-20 left-0 right-0 z-20 container mx-auto px-4 md:px-6 pointer-events-none">
                    <div className="max-w-4xl animate-in slide-in-from-bottom-10 duration-700 pointer-events-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border shadow-sm",
                                isOpen ? "bg-emerald-500/80 text-white border-emerald-400/50" : "bg-red-500/80 text-white border-red-400/50"
                            )}>
                                {isOpen ? "Abierto Ahora" : "Cerrado"}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold uppercase tracking-widest shadow-sm">
                                {place.tipo}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-6 drop-shadow-xl text-shadow-sm">
                            {place.nombre}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white font-medium text-sm md:text-base drop-shadow-md">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-emerald-400" />
                                <span className="text-shadow-sm">{place.zona}, {place.direccion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                <span className="font-bold">{place.promedioRating?.toFixed(1) || "Nuevo"}</span>
                                <span className="opacity-90">({place.cantidadResenas || 0} reseñas)</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 mt-12 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* MAIN CONTENT COL (8 span) */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Promotions (Cards) */}
                        {promotions.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <Tag className="h-5 w-5 text-orange-500" />
                                    <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-400">Ofertas Disponibles</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {promotions.map(promo => (
                                        <div key={promo._id} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-xl group hover:scale-[1.02] transition-transform">
                                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
                                            <div className="relative z-10">
                                                <div className="text-3xl font-black mb-1">-{promo.descuentoPorcentaje}%</div>
                                                <h3 className="text-xl font-bold mb-2 leading-tight">{promo.titulo}</h3>
                                                <p className="text-sm text-orange-100 opacity-90 line-clamp-2">{promo.descripcion}</p>
                                                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-xs font-bold text-orange-100">
                                                    <span>Valido hasta {new Date(promo.fechaFin).toLocaleDateString()}</span>
                                                    <span className="bg-white text-orange-600 px-3 py-1 rounded-full cursor-pointer hover:bg-orange-50">Canjear</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Description & Story */}
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
                            <h2 className="text-2xl font-black text-zinc-900 mb-4">Sobre {place.nombre}</h2>
                            <p className="text-zinc-600 text-lg leading-relaxed font-medium">
                                {place.descripcion || "Un lugar increíble que espera por ti. Descubre sus sabores y vive una experiencia única."}
                            </p>

                            {/* Tags */}
                            {place.tiposComida && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {place.tiposComida.map((tag, i) => (
                                        <span key={i} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-sm font-bold capitalize">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Highlights / Menu Preview */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Platos Destacados</h2>
                                <Button variant="outline" className="rounded-full border-zinc-200 hover:bg-zinc-100" onClick={() => setIsMenuOpen(true)}>
                                    Ver menú completo <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>

                            {dishes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dishes.slice(0, 4).map(dish => (
                                        <div key={dish._id} className="group bg-white rounded-3xl p-4 shadow-sm border border-zinc-100 hover:shadow-xl hover:border-emerald-100 transition-all cursor-default flex gap-5 items-center">
                                            <div className="h-24 w-24 shrink-0 rounded-2xl bg-zinc-100 overflow-hidden relative">
                                                {dish.foto ? (
                                                    <Image src={dish.foto} alt={dish.nombre} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-zinc-300"><Utensils className="h-6 w-6" /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-zinc-900 truncate pr-2 group-hover:text-emerald-700 transition-colors">{dish.nombre}</h3>
                                                    <span className="font-bold text-emerald-600 shrink-0">Bs {dish.precio}</span>
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{dish.descripcion}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-zinc-100 rounded-3xl p-8 text-center text-zinc-500">
                                    Menú en actualización.
                                </div>
                            )}
                        </section>

                        {/* Reviews */}
                        <section>
                            <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-8">Opiniones</h2>
                            <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm">

                                {/* Form */}
                                <div className="mb-10 p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                    <h3 className="font-bold text-lg mb-4">Deja tu opinión</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="flex gap-2 mb-4">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button key={star} type="button" onClick={() => setNewReview({ ...newReview, rating: star })} className={cn("transition-transform hover:scale-110", newReview.rating >= star ? "text-amber-400" : "text-zinc-200")}>
                                                    <Star className="h-8 w-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                        <Textarea
                                            value={newReview.comentario}
                                            onChange={e => setNewReview({ ...newReview, comentario: e.target.value })}
                                            placeholder="Comparte tu experiencia..."
                                            className="bg-white border-zinc-200 rounded-2xl min-h-[100px] mb-4 text-base focus:ring-emerald-500/20"
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={submittingReview} className="rounded-full bg-black text-white hover:bg-zinc-800 px-8">
                                                {submittingReview ? "Publicando..." : "Publicar"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>

                                {/* List */}
                                <div className="space-y-8">
                                    {reviews.map(review => (
                                        <div key={review._id} className="flex gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden relative shadow-lg shadow-indigo-500/20">
                                                {review.usuarioId?.fotoPerfil ? (
                                                    <Image src={review.usuarioId.fotoPerfil} alt="" fill className="object-cover" />
                                                ) : review.usuarioId?.nombre?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-zinc-900">{review.usuarioId?.nombre || "Usuario"}</span>
                                                    <span className="text-xs text-zinc-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex text-amber-400 mb-2">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-zinc-200")} />
                                                    ))}
                                                </div>
                                                <p className="text-zinc-600 font-medium leading-relaxed">{review.comentario}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && <p className="text-zinc-400 text-center italic">Sé el primero en opinar.</p>}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* SIDEBAR COL (4 span) - Sticky */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Info Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 sticky top-8">
                            <h3 className="font-bold text-zinc-900 mb-6 uppercase tracking-wider text-xs">Información</h3>

                            <div className="space-y-6">
                                {/* Location */}
                                <div>
                                    <div className="flex items-center gap-2 font-bold text-zinc-900 mb-2">
                                        <MapPin className="h-4 w-4 text-emerald-600" /> Ubicación
                                    </div>
                                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 border border-zinc-100 relative">
                                        <Map places={[place]} />
                                    </div>
                                    <Button variant="outline" className="w-full rounded-xl text-xs font-bold" onClick={() => window.open(`https://maps.google.com/?q=${place.coordenadas.coordinates[1]},${place.coordenadas.coordinates[0]}`)}>
                                        Como llegar
                                    </Button>
                                </div>

                                <div className="h-px bg-zinc-100" />

                                {/* Schedule Details */}
                                {place.horario && Object.keys(place.horario).length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 font-bold text-zinc-900 mb-3">
                                            <Clock className="h-4 w-4 text-emerald-600" /> Horarios
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(day => {
                                                const schedule = place.horario[day];
                                                if (!schedule) return null;
                                                const isToday = new Date().getDay() === (day === 'domingo' ? 0 : ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].indexOf(day) + 1);

                                                return (
                                                    <div key={day} className={cn("flex justify-between", isToday ? "font-bold text-zinc-900" : "text-zinc-500")}>
                                                        <span className="capitalize w-24">{day}</span>
                                                        <span>
                                                            {schedule.cerrado ? (
                                                                <span className="text-red-400">Cerrado</span>
                                                            ) : (
                                                                `${schedule.apertura} - ${schedule.cierre}`
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-zinc-100" />

                                {/* Services & Payments */}
                                {(place.servicios?.length > 0 || place.metodosPago?.length > 0) && (
                                    <div className="space-y-6">
                                        {place.servicios?.length > 0 && (
                                            <div>
                                                <div className="font-bold text-zinc-900 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-emerald-600" /> Servicios
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {place.servicios.map(s => {
                                                        const key = s.toLowerCase().replace(/_/g, '');
                                                        const serviceConfig: Record<string, { icon: React.ReactNode, label: string }> = {
                                                            wifi: { icon: <Wifi className="h-4 w-4" />, label: 'WiFi Gratis' },
                                                            parallevar: { icon: <Utensils className="h-4 w-4" />, label: 'Para Llevar' },
                                                            delivery: { icon: <Phone className="h-4 w-4" />, label: 'Delivery' },
                                                            estacionamiento: { icon: <MapPin className="h-4 w-4" />, label: 'Estacionamiento' },
                                                            reservas: { icon: <Clock className="h-4 w-4" />, label: 'Reservas' },
                                                            aireacondicionado: { icon: <Check className="h-4 w-4" />, label: 'Aire Acond.' },
                                                            musicaenvivo: { icon: <MessageSquare className="h-4 w-4" />, label: 'Música en Vivo' },
                                                        };

                                                        const config = serviceConfig[key] || {
                                                            icon: <Check className="h-4 w-4" />,
                                                            label: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                                        };

                                                        return (
                                                            <div key={s} className="px-4 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-2.5 transform hover:scale-105 transition-all cursor-default">
                                                                <div className="bg-white/20 p-1 rounded-full">{config.icon}</div>
                                                                <span className="truncate tracking-wide">{config.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {place.metodosPago?.length > 0 && (
                                            <div>
                                                <div className="font-bold text-zinc-900 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-emerald-600" /> Métodos de Pago
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {place.metodosPago.map(p => {
                                                        const key = p.toLowerCase();
                                                        const payConfig: Record<string, { icon: React.ReactNode, label: string }> = {
                                                            efectivo: { icon: <DollarSign className="h-3 w-3" />, label: 'Efectivo' },
                                                            qr: { icon: <Camera className="h-3 w-3" />, label: 'Pago QR' },
                                                            tarjeta: { icon: <CreditCard className="h-3 w-3" />, label: 'Tarjeta' },
                                                            transferencia: { icon: <Globe className="h-3 w-3" />, label: 'Transferencia' },
                                                        };

                                                        const config = payConfig[key] || {
                                                            icon: <CreditCard className="h-3 w-3" />,
                                                            label: p
                                                        };

                                                        return (
                                                            <span key={p} className="px-4 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-sm hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md transition-all cursor-default">
                                                                <div className="bg-emerald-50 p-1 rounded-full text-emerald-600">{config.icon}</div>
                                                                <span className="truncate tracking-wide">{config.label}</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="h-px bg-zinc-100" />

                                {/* Contact */}
                                <div className="space-y-4">
                                    {place.telefonoContacto && (
                                        <a
                                            href={`https://wa.me/${(() => {
                                                const nums = place.telefonoContacto.replace(/\D/g, '');
                                                return nums.startsWith('591') ? nums : `591${nums}`;
                                            })()}`}
                                            target="_blank"
                                            className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group"
                                        >
                                            <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                                                <Phone className="h-6 w-6" />
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <div className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-0.5">WhatsApp / Pedidos</div>
                                                <div className="font-black truncate text-lg text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                                    {place.telefonoContacto.replace(/^\+?591\s?/, '')}
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </a>
                                    )}

                                    {/* Social Networks List */}
                                    {/* Social Networks List */}
                                    {(() => {
                                        let socials = place.redesSociales || {};
                                        // Normalize Legacy Array Data
                                        if (Array.isArray(socials)) {
                                            const newSocials: Record<string, string> = {};
                                            socials.forEach((item: any) => {
                                                if (item.platform && item.url) {
                                                    newSocials[item.platform.toLowerCase()] = item.url;
                                                }
                                            });
                                            socials = newSocials;
                                        }

                                        if (Object.keys(socials).length === 0) return null;

                                        return (
                                            <div className="space-y-2">
                                                <div className="font-bold text-zinc-900 text-xs uppercase tracking-wider mb-2">Encuéntranos en</div>

                                                {Object.entries(socials).map(([rawKey, url]) => {
                                                    if (!url) return null;
                                                    const key = rawKey.toLowerCase();

                                                    // Configuration for each network
                                                    const networks: Record<string, { icon: React.ReactNode, label: string, color: string, textColor: string, border: string }> = {
                                                        facebook: {
                                                            icon: <Facebook className="h-4 w-4" />,
                                                            label: 'Facebook',
                                                            color: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20',
                                                            textColor: 'text-[#1877F2]',
                                                            border: 'border-[#1877F2]/20'
                                                        },
                                                        instagram: {
                                                            icon: <Instagram className="h-4 w-4" />,
                                                            label: 'Instagram',
                                                            color: 'bg-[#E4405F]/10 hover:bg-[#E4405F]/20',
                                                            textColor: 'text-[#E4405F]',
                                                            border: 'border-[#E4405F]/20'
                                                        },
                                                        tiktok: {
                                                            icon: <div className="font-black text-[10px] leading-none">TK</div>,
                                                            label: 'TikTok',
                                                            color: 'bg-black/5 hover:bg-black/10',
                                                            textColor: 'text-black',
                                                            border: 'border-black/10'
                                                        },
                                                        website: {
                                                            icon: <Globe className="h-4 w-4" />,
                                                            label: 'Sitio Web',
                                                            color: 'bg-zinc-100 hover:bg-zinc-200',
                                                            textColor: 'text-zinc-700',
                                                            border: 'border-zinc-200'
                                                        }
                                                    };

                                                    // Use configured network or fallback to Generic Website but with capitalized key as label
                                                    const config = networks[key] || {
                                                        ...networks.website,
                                                        label: key.charAt(0).toUpperCase() + key.slice(1) // Fallback label
                                                    };

                                                    // Try to extract handle from URL
                                                    let handle = config.label;
                                                    try {
                                                        const urlObj = new URL(url as string);
                                                        const pathParts = urlObj.pathname.split('/').filter(Boolean);
                                                        if (pathParts.length > 0) handle = `@${pathParts[pathParts.length - 1]}`;
                                                    } catch (e) {
                                                        // If not a URL, maybe it's just a handle?
                                                        if (typeof url === 'string' && url.startsWith('@')) handle = url;
                                                        else if (typeof url === 'string') handle = url;
                                                    }

                                                    // Normalize URL for href
                                                    let href = url as string;
                                                    if (!href.startsWith('http') && !href.startsWith('//')) {
                                                        // Heuristics for basic handles
                                                        if (key === 'instagram') href = `https://instagram.com/${href.replace('@', '')}`;
                                                        else if (key === 'facebook') href = `https://facebook.com/${href}`;
                                                        else if (key === 'tiktok') href = `https://tiktok.com/@${href.replace('@', '')}`;
                                                        else href = `https://${href}`;
                                                    }

                                                    return (
                                                        <a
                                                            key={key}
                                                            href={href}
                                                            target="_blank"
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-xl border transition-all group", // Changed rounded-2xl to rounded-xl
                                                                config.color,
                                                                config.border
                                                            )}
                                                        >
                                                            <div className={cn("h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm", config.textColor)}>
                                                                {config.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={cn("text-[10px] font-bold uppercase opacity-60 flex justify-between tracking-wider", config.textColor)}>
                                                                    {config.label}
                                                                </div>
                                                                <div className={cn("font-bold truncate text-sm", config.textColor)}>
                                                                    {handle}
                                                                </div>
                                                            </div>
                                                            <ArrowRight className={cn("h-4 w-4 -rotate-45 opacity-0 group-hover:opacity-100 transition-opacity", config.textColor)} />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}

                                    {place.emailContacto && (
                                        <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-zinc-50">
                                            <div className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-400">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Email</div>
                                                <div className="font-bold truncate text-sm text-zinc-700">{place.emailContacto}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* REDESIGNED MENU MODAL */}
            <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DialogContent className="max-w-5xl w-[90vw] h-[80vh] z-[100] overflow-hidden bg-white border-none rounded-[2rem] p-0 flex shadow-2xl">
                    <DialogTitle className="sr-only">Menú Completo</DialogTitle>
                    {/* Sidebar Categories */}
                    <div className="w-72 bg-zinc-50 border-r border-zinc-100 hidden md:flex flex-col h-full shrink-0">
                        <div className="p-8 border-b border-zinc-100">
                            <h3 className="font-black text-2xl text-zinc-900 flex items-center gap-3">
                                <Utensils className="h-6 w-6 text-emerald-600" /> Menú
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {menuCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedMenuCategory(cat)}
                                    className={cn(
                                        "w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                                        selectedMenuCategory === cat
                                            ? "bg-black text-white shadow-xl shadow-zinc-900/10 scale-105"
                                            : "text-zinc-500 hover:bg-white hover:shadow-md hover:text-zinc-900"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col h-full bg-white relative">
                        {/* Header */}
                        <div className="px-8 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 sticky top-0 border-b border-zinc-100">
                            <div>
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{selectedMenuCategory}</h2>
                                <p className="text-zinc-400 font-medium mt-1">{filteredDishes.length} opciones disponibles</p>
                            </div>

                            <div className="flex-1 max-w-sm mx-8 hidden md:block">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar en el menú..."
                                        className="w-full bg-zinc-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 text-zinc-400">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>



                            <Button variant="ghost" className="h-12 w-12 rounded-full bg-zinc-50 hover:bg-zinc-100 hover:scale-110 transition-all border border-zinc-200" onClick={() => setIsMenuOpen(false)}>
                                <X className="h-6 w-6 text-zinc-900" />
                            </Button>
                        </div>

                        {/* Mobile Categories (Horizontal Scroll) */}
                        <div className="md:hidden flex gap-2 overflow-x-auto p-4 border-b border-zinc-50 scrollbar-none">
                            {menuCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedMenuCategory(cat)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                        selectedMenuCategory === cat
                                            ? "bg-black text-white border-black"
                                            : "text-zinc-600 border-zinc-200"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDishes.map(dish => (
                                    <div key={dish._id} className="group flex flex-col bg-zinc-50 hover:bg-white rounded-3xl overflow-hidden border border-zinc-100 hover:border-emerald-100 hover:shadow-xl transition-all duration-300">
                                        <div className="aspect-square relative overflow-hidden bg-zinc-200">
                                            {dish.foto ? (
                                                <Image src={dish.foto} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-zinc-300">
                                                    <Utensils className="h-12 w-12 opacity-50" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span className="bg-white/90 backdrop-blur text-emerald-800 text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                                                    Bs {dish.precio}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-zinc-900 leading-tight">{dish.nombre}</h3>
                                            </div>
                                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4 flex-1">{dish.descripcion}</p>

                                            {dish.etiquetas && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {dish.etiquetas.slice(0, 3).map((t, i) => (
                                                        <span key={i} className="bg-white text-zinc-400 border border-zinc-100 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredDishes.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400">
                                    <Utensils className="h-16 w-16 mb-4 opacity-20" />
                                    <p>No hay platos en esta categoría.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
