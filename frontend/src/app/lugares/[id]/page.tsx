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
import { Star, MapPin, Clock, ArrowLeft, Heart, Share2, MessageSquare, Tag } from "lucide-react";

// Dynamic Map
const Map = dynamic(() => import("@/components/features/Map"), {
  loading: () => <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center text-zinc-400">Cargando mapa...</div>,
  ssr: false
});

interface Review {
  _id: string;
  usuario: { nombre: string; _id: string };
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
  menu: {
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
  }[];
  coordenadas: {
    coordinates: [number, number];
  };
}

export default function PlaceDetailPage() {
  const params = useParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Form
  const [newReview, setNewReview] = useState({ rating: 5, comentario: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!params.id) return;
        const [placeRes, reviewsRes, promosRes] = await Promise.all([
            api.get(`/lugares/${params.id}`),
            api.get(`/lugares/${params.id}/resenas`),
            api.get(`/lugares/${params.id}/promociones`)
        ]);

        setPlace(placeRes.data);
        setReviews(reviewsRes.data);
        setPromotions(promosRes.data);
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
          setReviews(res.data);
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
     // Simple display, logic can be complex
     return "Consultar horario detallado"; 
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Image */}
      <div className="relative w-full h-64 md:h-96 bg-zinc-200">
        {place.fotos && place.fotos.length > 0 ? (
          <Image
            src={place.fotos[0]}
            alt={place.nombre}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
            Sin foto
          </div>
        )}
        <div className="absolute top-4 left-4">
           <Link href="/">
            <Button variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 h-auto">
              <ArrowLeft className="h-5 w-5 text-black" />
            </Button>
           </Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 h-auto text-black">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 h-auto text-black">
              <Heart className="h-5 w-5" />
            </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-t-3xl md:rounded-xl shadow-sm border border-zinc-100 p-6 md:p-8">
            
            {/* Title & Badge */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                            {place.tipo}
                        </span>
                        <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-black font-bold text-sm ml-1">{place.promedioRating || 0}</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{place.nombre}</h1>
                    <div className="flex flex-col gap-1 text-zinc-500 text-sm">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{place.direccion}, {place.zona}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{formatSchedule(place.horario)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row md:flex-col gap-3">
                     <Button className="flex-1 bg-black text-white px-6">Ir ahora</Button>
                     <Button variant="outline" className="flex-1">Ver menú</Button>
                </div>
            </div>

            {/* Promotions Banner */}
            {promotions.length > 0 && (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                    <h3 className="flex items-center gap-2 font-bold text-orange-800 mb-2">
                        <Tag className="h-5 w-5" /> Promociones Activas
                    </h3>
                    <div className="grid gap-2">
                        {promotions.map(promo => (
                            <div key={promo._id} className="flex justify-between items-center bg-white p-3 rounded border border-orange-100 shadow-sm">
                                <div>
                                    <span className="font-bold text-orange-600 block">{promo.titulo}</span>
                                    <span className="text-xs text-zinc-500">{promo.descripcion}</span>
                                </div>
                                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">-{promo.descuentoPorcentaje}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {/* Info & Menu & Reviews */}
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold mb-3">Sobre el lugar</h2>
                        <p className="text-zinc-600 leading-relaxed">
                            {place.descripcion || "Sin descripción disponible."}
                        </p>
                    </section>
                    
                    <hr className="border-zinc-100" />

                    <section>
                         <h2 className="text-xl font-bold mb-4">Menú destacado</h2>
                         {place.menu && place.menu.length > 0 ? (
                            <div className="space-y-4">
                                {place.menu.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start group">
                                        <div>
                                            <h3 className="font-medium group-hover:text-emerald-700 transition-colors">{item.nombre}</h3>
                                            <p className="text-sm text-zinc-500 line-clamp-1">{item.descripcion}</p>
                                        </div>
                                        <div className="font-bold text-zinc-900">
                                            Bs {item.precio}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <p className="text-zinc-400 italic">No hay menú registrado.</p>
                         )}
                    </section>

                    <hr className="border-zinc-100" />
                    
                    {/* Reviews */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> Reseñas
                        </h2>
                        
                        {/* List */}
                        <div className="space-y-6 mb-8">
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review._id} className="bg-zinc-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-sm block">{review.usuario?.nombre || "Usuario"}</span>
                                            <span className="text-[10px] text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex text-yellow-500 text-xs">
                                           {Array.from({length: 5}).map((_, i) => (
                                               <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-zinc-300'}`} />
                                           ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-700">{review.comentario}</p>
                                </div>
                            )) : (
                                <p className="text-zinc-500 italic text-sm">Aún no hay reseñas. ¡Sé el primero!</p>
                            )}
                        </div>

                        {/* Form */}
                        <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                            <h3 className="font-bold mb-4">Escribir una reseña</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Tu calificación</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} 
                                                type="button" 
                                                onClick={() => setNewReview({...newReview, rating: star})}
                                                className={`focus:outline-none transition-transform hover:scale-110 ${newReview.rating >= star ? "text-yellow-500" : "text-zinc-300"}`}
                                            >
                                                <Star className="h-6 w-6 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Tu comentario</label>
                                    <Textarea 
                                        placeholder="¿Qué te pareció la comida?" 
                                        className="bg-white"
                                        value={newReview.comentario}
                                        onChange={(e) => setNewReview({...newReview, comentario: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={submittingReview}>
                                        {submittingReview ? "Publicando..." : "Publicar Reseña"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-50 p-1 rounded-xl border border-zinc-100 overflow-hidden shadow-sm">
                         <div className="px-3 py-2 bg-white border-b border-zinc-100 mb-1">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Ubicación
                            </h3>
                         </div>
                         <div className="aspect-square w-full relative z-0">
                             <Map places={[place]} />
                         </div>
                         <div className="p-3">
                             <Button variant="outline" className="w-full text-xs h-8" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.coordenadas.coordinates[1]},${place.coordenadas.coordinates[0]}`, '_blank')}>
                                 Abrir en Google Maps
                             </Button>
                         </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
