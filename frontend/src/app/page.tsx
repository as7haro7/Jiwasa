"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import api from "@/lib/api";
import { Search, MapPin, RefreshCw, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfferCard } from "@/components/features/home/OfferCard";
import { PlaceListCard } from "@/components/features/home/PlaceListCard";
import { BookedCard } from "@/components/features/home/BookedCard";
import { NewPlaceCard } from "@/components/features/home/NewPlaceCard";

// Dynamic import for Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/features/Map"), {
  loading: () => <div className="h-96 w-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center text-zinc-400">Cargando mapa...</div>,
  ssr: false
});

interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
  fotos: string[];
  promedioRating: number;
  coordenadas: {
    coordinates: [number, number];
  };
}

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapPlaces, setMapPlaces] = useState<Place[]>([]);
  const [allMapPlaces, setAllMapPlaces] = useState<Place[]>([]); // Copy of full list
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // showMap removed
  const [distance, setDistance] = useState(2); // km
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesRes, mapRes] = await Promise.all([
          api.get("/lugares"),
          api.get("/lugares/mapa")
        ]);
        
        setPlaces(placesRes.data.places || []);
        setMapPlaces(mapRes.data || []);
        setAllMapPlaces(mapRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización");
        return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            
            try {
                const response = await api.get("/lugares/cercanos", {
                    params: { lat: latitude, lng: longitude, dist: distance }
                });
                setMapPlaces(response.data);
            } catch (error) {
                console.error("Error fetching nearby places:", error);
            } finally {
                setLocationLoading(false);
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
            setLocationLoading(false);
            alert("No pudimos obtener tu ubicación. Verifica tus permisos.");
        }
    );
  };

  const featuredPlaces = places.slice(0, 4); 

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero / Search Section */}
      <div className="relative w-full bg-black text-white py-24 px-4 flex flex-col items-center justify-center text-center space-y-8">
          <div className="absolute inset-0 bg-[url('/baner.jpg')] opacity-20 bg-cover bg-center" />
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Los mejores sabores de La Paz
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto">
                Encuentra y disfruta desde comida callejera hasta la mejor gastronomía local.
            </p>
          </div>
          
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-sm p-1.5 flex flex-col md:flex-row items-center shadow-xl divide-y md:divide-y-0 md:divide-x divide-zinc-200">
              <div className="flex-1 flex items-center w-full md:w-auto px-4 h-12">
                  <MapPin className="h-5 w-5 text-zinc-500 shrink-0" />
                  <Input 
                    className="border-none shadow-none focus-visible:ring-0 text-black text-base placeholder:text-zinc-500 w-full"
                    placeholder="Cerca de mí"
                    defaultValue="Cerca de mí" 
                  />
              </div>

              <div className="flex-[1.5] flex items-center w-full md:w-auto px-4 h-12">
                  <Search className="h-5 w-5 text-zinc-500 shrink-0" />
                  <Input 
                    className="border-none shadow-none focus-visible:ring-0 text-black text-base placeholder:text-zinc-500 w-full"
                    placeholder="Buscar salteñas, zona sur..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
              </div>

              <Button className="w-full md:w-auto h-12 px-8 rounded-sm bg-[#007068] hover:bg-[#005a54] text-white font-bold text-base transition-colors uppercase tracking-wide">
                  Búsqueda
              </Button>
          </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Toggle Map View for Mobile / Highlight for Desktop */}
         <section>
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                <div>
                   <h2 className="text-2xl font-bold">Explora La Paz</h2>
                   <p className="text-zinc-500 text-sm">Descubre lugares increíbles en el mapa.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="flex flex-col px-2 w-32 md:w-48">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Radio</span>
                            <span className="text-xs font-bold text-[#007068]">{distance} km</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            step="0.5"
                            value={distance}
                            onChange={(e) => setDistance(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#007068]"
                        />
                    </div>
                    <div className="h-8 w-px bg-zinc-100 mx-1"></div>
                    
                    {userLocation ? (
                        <div className="flex gap-2">
                             <Button 
                                size="sm"
                                onClick={handleUseLocation} // Re-search with new distance
                                disabled={locationLoading}
                                className="text-xs h-8 bg-zinc-900 text-white hover:bg-zinc-800"
                            >
                                {locationLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : <RefreshCw className="h-3 w-3"/>}
                            </Button>
                            <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setUserLocation(null);
                                    setMapPlaces(allMapPlaces);
                                }}
                                className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            size="sm"
                            onClick={handleUseLocation}
                            disabled={locationLoading}
                            className={cn("text-xs h-8 bg-zinc-900 text-white hover:bg-zinc-800", locationLoading ? "opacity-80" : "")}
                        >
                            {locationLoading ? <><div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/> Buscar</> : <><MapPin className="h-3 w-3 mr-2"/> Cerca de mí</>}
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden shadow-sm border border-zinc-200 relative group">
                <Map places={mapPlaces} userLocation={userLocation} radius={distance} />
                {userLocation && (
                    <div className="absolute top-4 right-4 z-[400] bg-white px-3 py-1.5 rounded-full shadow-lg text-xs font-bold text-blue-700 border border-blue-100 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                        <MapPin className="h-3 w-3 fill-blue-700"/> Ubicación actual
                    </div>
                )}
            </div>

            {/* Optional: Show list of found places below map if filtering */}
            {userLocation && mapPlaces.length > 0 && (
                <div className="mt-8">
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600"/> 
                        {mapPlaces.length} lugares encontrados cerca de ti
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {mapPlaces.slice(0, 4).map((place) => (
                            <PlaceListCard key={place._id} place={place} />
                        ))}
                    </div>
                </div>
            )}
         </section>

        {/* Categories Section */}
        <section>
            <h2 className="text-2xl font-bold mb-6">Explora por categorías</h2>
            <div className="relative group">
                <div 
                    ref={scrollContainerRef}
                    className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar scroll-smooth"
                >
                    {[
                    { name: "Restaurantes", type: "restaurante", description: "Experiencias gourmet", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" },
                    { name: "Cafés", type: "café", description: "Aromas y pausas", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80" },
                    { name: "Bares", type: "bar", description: "Noches paceñas", image: "https://plus.unsplash.com/premium_photo-1661695810257-35142e1415ca?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
                    { name: "Food Trucks", type: "food_truck", description: "Innovación al paso", image: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600&q=80" },
                    { name: "Callejero", type: "callejero", description: "El alma de la ciudad", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80" },
                    { name: "Mercados", type: "mercado", description: "Frescura y tradición", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80" },
                    ].map((cat) => (
                        <Link 
                            href={`/search?tipo=${cat.type}`} 
                            key={cat.name} 
                            className="group/card flex-none w-[80vw] md:w-[32%] snap-center relative"
                        >
                        <div className="rounded-2xl h-[320px] relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out group-hover/card:-translate-y-2">
                            {/* Background Image with Zoom Effect */}
                            <img 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    className="absolute inset-0 w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700" 
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity" />
                            
                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                                    <p className="text-emerald-400 font-medium tracking-wider uppercase text-xs mb-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover/card:translate-y-0">
                                        Explorar {cat.name}
                                    </p>
                                    <h3 className="text-white text-4xl font-bold mb-2 tracking-tight">{cat.name}</h3>
                                    <p className="text-zinc-300 text-lg font-medium">{cat.description}</p>
                            </div>

                            {/* Interactive Arrow Button */}
                            <div className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 group-hover/card:rotate-45">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                            </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {/* Desktop Navigation Controls */}
                <button 
                    onClick={() => scrollContainerRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                    className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-black hover:bg-zinc-100 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => scrollContainerRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-black hover:bg-zinc-100 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </section>

        {/* Nuestras mejores ofertas */}
        <section>
             <h2 className="text-2xl font-bold mb-2">Nuestras mejores ofertas</h2>
             <p className="text-zinc-500 mb-6">Descuentos exclusivos de hasta el 50%</p>
             
             {loading ? <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {places.slice(0, 4).map((place) => (
                    <OfferCard key={place._id} place={place} />
                ))}
             </div>}
        </section>

         {/* Lo mejor para ti */}
        <section className="bg-zinc-50 -mx-4 px-4 py-12 md:rounded-2xl md:mx-0 md:px-8">
             <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-bold">Lo mejor para ti</h2>
                    <p className="text-zinc-500">Selección basada en tus gustos</p>
                 </div>
             </div>
              {loading ? <div className="h-64 bg-zinc-200 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {places.slice(0, 3).map((place) => (
                    <PlaceListCard key={place._id + 'foryou'} place={place} />
                ))}
             </div>}
        </section>

        {/* Los más reservados del mes */}
        <section>
             <h2 className="text-2xl font-bold mb-6">Los más reservados del mes</h2>
              {loading ? <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {places.slice(0, 4).map((place) => (
                    <BookedCard key={place._id + 'booked'} place={place} />
                ))}
             </div>}
        </section>
        
        {/* Top 100 La Paz */}
         <section className="bg-black text-white rounded-2xl p-8 md:p-12 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black to-transparent z-10" />
             <div className="absolute inset-0 bg-[url('/baner.jpg')] bg-cover bg-center opacity-40" />
             
             <div className="relative z-20 max-w-lg space-y-6">
                 <div className="inline-block bg-[#5ba829] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                     Guía 2025
                 </div>
                 <h2 className="text-4xl font-bold">Top 100 La Paz</h2>
                 <p className="text-zinc-300 text-lg">
                     Descubre los restaurantes que definen la gastronomía paceña este año.
                 </p>
                 <Button className="bg-white text-black hover:bg-zinc-200 h-12 px-8 rounded-sm text-base font-medium">
                     Ver la lista completa
                 </Button>
             </div>
         </section>

         {/* Nuevo y digno de atención */}
        <section>
             <h2 className="text-2xl font-bold mb-6">Nuevo y digno de atención</h2>
              {loading ? <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {places.slice(0, 3).map((place) => (
                    <NewPlaceCard key={place._id + 'new'} place={place} />
                ))}
            </div>}
        </section>

        {/* Banner Section (Owner) */}
        <section className="bg-zinc-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-zinc-200">
            <div className="space-y-4 max-w-lg text-center md:text-left">
                <h2 className="text-3xl font-bold">¿Eres propietario de un restaurante?</h2>
                <p className="text-zinc-600 text-lg">
                    Únete a JIWASA y haz que miles de personas descubran tu sabor.
                </p>
                <Button className="bg-black text-white hover:bg-zinc-800 h-12 px-8 rounded-full text-base">
                    Registra tu negocio
                </Button>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-zinc-200 rounded-xl" />
        </section>

      </div>
    </div>
  );
}

