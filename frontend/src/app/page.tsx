"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import api from "@/lib/api";
import { Search, MapPin, RefreshCw, X, Loader2, ChevronLeft, ChevronRight, UtensilsCrossed, Coffee, Martini, Truck, Footprints, Store } from "lucide-react";
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
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero / Search Section (Full Screen) */}
            <header className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden bg-black">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                    {/* Netflix Gradient for Navbar Readability */}
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/90 to-transparent z-10 pointer-events-none" />
                </div>

                <div className="relative z-10 space-y-6 max-w-5xl px-4 animate-in fade-in zoom-in duration-1000">
                    <div className="inline-flex items-center gap-2 mb-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-100 text-xs font-bold tracking-widest uppercase">
                            Descubre La Paz
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                        SABORES <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">QUE CONECTAN.</span>
                    </h1>
                    <p className="text-zinc-200 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed text-shadow-sm">
                        La guía gastronómica definitiva. Explora desde comida callejera hasta alta cocina en un solo lugar.
                    </p>

                    {/* Central Search Bar */}
                    <div className="w-full max-w-3xl mx-auto mt-12">
                        <div className="bg-white rounded-full p-2 md:p-3 flex items-center shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ring-4 ring-white/10">
                            <div className="hidden md:flex flex-1 items-center px-6 h-14 border-r border-zinc-200">
                                <MapPin className="h-6 w-6 text-emerald-600 shrink-0 mr-4" />
                                <Input
                                    className="border-none shadow-none focus-visible:ring-0 text-zinc-900 font-bold text-lg placeholder:text-zinc-400 w-full bg-transparent p-0"
                                    placeholder="¿En qué zona estás?"
                                />
                            </div>
                            <div className="flex-[1.5] flex items-center px-4 md:px-6 h-14">
                                <Search className="h-6 w-6 text-zinc-400 shrink-0 mr-4" />
                                <Input
                                    className="border-none shadow-none focus-visible:ring-0 text-zinc-900 font-bold text-lg placeholder:text-zinc-400 w-full bg-transparent p-0"
                                    placeholder="Buscar restaurantes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            window.location.href = `/search?q=${searchTerm}`;
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                onClick={() => window.location.href = `/search?q=${searchTerm}`}
                                className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center shrink-0 shadow-lg"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 space-y-16">

                {/* Map Section Removed from here */}

                {/* Categories Bento Grid */}
                <section className="px-6 md:px-12 lg:px-24 mt-24">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
                                Categorías <span className="text-[#007068]">.</span>
                            </h2>
                            <p className="text-zinc-500 font-medium">Encuentra exactamente lo que buscas.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[200px]">
                        {[
                            {
                                name: "Restaurantes",
                                type: "restaurante",
                                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
                                className: "md:col-span-2 md:row-span-2",
                                icon: <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><UtensilsCrossed className="h-6 w-6" /></div>
                            },
                            {
                                name: "Cafés",
                                type: "café",
                                image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
                                className: "md:col-span-1 md:row-span-2",
                                icon: <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><Coffee className="h-6 w-6" /></div>
                            },
                            {
                                name: "Bares",
                                type: "bar",
                                image: "https://plus.unsplash.com/premium_photo-1661695810257-35142e1415ca?q=80&w=880",
                                className: "md:col-span-1 md:row-span-1",
                                icon: <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><Martini className="h-6 w-6" /></div>
                            },
                            {
                                name: "Callejero",
                                type: "callejero",
                                image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
                                className: "md:col-span-1 md:row-span-1",
                                icon: <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><Footprints className="h-6 w-6" /></div>
                            },
                            {
                                name: "Mercados",
                                type: "mercado",
                                image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80",
                                className: "md:col-span-2 md:row-span-1",
                                icon: <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><Store className="h-6 w-6" /></div>
                            },
                            {
                                name: "Food Trucks",
                                type: "food_truck",
                                image: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600&q=80",
                                className: "md:col-span-2 md:row-span-1",
                                icon: <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><Truck className="h-6 w-6" /></div>
                            },
                        ].map((cat) => (
                            <Link
                                href={`/search?tipo=${cat.type}`}
                                key={cat.name}
                                className={cn(
                                    "group relative overflow-hidden rounded-3xl cursor-pointer hover:shadow-2xl transition-all duration-500",
                                    cat.className
                                )}
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />

                                <div className="absolute bottom-0 left-0 p-6 z-30 w-full transform group-hover:translate-y-[-4px] transition-transform duration-300">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            {cat.icon}
                                            <h3 className="text-white text-xl md:text-2xl font-bold mt-3 tracking-tight">{cat.name}</h3>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Explora tu zona (Moved Map Here) */}
                <section className="mt-32 mb-32 container mx-auto px-6">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                            <div>
                                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">
                                    Geolocalización
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                                    Explora tu zona
                                </h2>
                                <p className="text-zinc-500 text-sm font-medium mt-1">Encuentra joyas ocultas cerca de ti.</p>
                            </div>

                            <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-zinc-200 shadow-sm">
                                <div className="flex flex-col px-4 w-32 md:w-48">
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
                                            onClick={handleUseLocation}
                                            disabled={locationLoading}
                                            className="text-xs h-9 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-4"
                                        >
                                            {locationLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setUserLocation(null);
                                                setMapPlaces(allMapPlaces);
                                            }}
                                            className="text-xs h-9 w-9 p-0 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={handleUseLocation}
                                        disabled={locationLoading}
                                        className={cn("text-xs h-9 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-4 font-bold shadow-lg shadow-zinc-900/20", locationLoading ? "opacity-80" : "")}
                                    >
                                        {locationLoading ? <><div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> buscando...</> : <><MapPin className="h-3 w-3 mr-2" /> Usar mi ubicación</>}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/50 border border-zinc-200 relative group">
                            <Map places={mapPlaces} userLocation={userLocation} radius={distance} />
                            {userLocation && (
                                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-xs font-bold text-blue-700 border border-blue-100 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    Estás aquí
                                </div>
                            )}

                            <div className="absolute bottom-4 left-4 z-10">
                                <Button className="bg-white/90 backdrop-blur text-black hover:bg-white border border-zinc-200 shadow-xl rounded-full text-xs font-bold">
                                    Ver en pantalla completa
                                </Button>
                            </div>
                        </div>
                        {/* Optional: Show list of found places below map if filtering */}
                        {userLocation && mapPlaces.length > 0 && (
                            <div className="mt-8 border-t border-zinc-100 pt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    {mapPlaces.length} lugares encontrados cerca de ti
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {mapPlaces.slice(0, 4).map((place) => (
                                        <PlaceListCard key={place._id} place={place} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Nuestras mejores ofertas */}
                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 relative inline-block">
                                Ofertas
                                <span className="absolute -bottom-2 left-0 w-full h-2 bg-emerald-400/30 rounded-full"></span>
                            </h2>
                            <p className="text-zinc-500 font-medium">Descuentos exclusivos de hasta el 50%.</p>
                        </div>
                        <Button variant="outline" className="hidden md:flex rounded-full px-6">Ver todas</Button>
                    </div>

                    {loading ? <div className="h-64 bg-zinc-100 rounded-3xl animate-pulse" /> :
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {places.slice(0, 4).map((place) => (
                                <OfferCard key={place._id} place={place} />
                            ))}
                        </div>}
                </section>

                {/* Lo mejor para ti */}
                <section className="relative overflow-hidden bg-zinc-900 -mx-6 px-6 py-24 md:rounded-[2rem] md:mx-0 md:px-16 text-white">
                    {/* Background noise/texture */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                        <div className="max-w-xl">
                            <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-2 block">Personalizado</span>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
                                Tu Selección
                            </h2>
                            <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                                Curamos esta lista basándonos en tus gustos y lugares que has visitado anteriormente.
                            </p>
                        </div>
                    </div>

                    {loading ? <div className="h-64 bg-zinc-800 rounded-3xl animate-pulse" /> :
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {places.slice(0, 3).map((place) => (
                                <PlaceListCard key={place._id + 'foryou'} place={place} /> // Assuming PlaceListCard styles can handle dark mode or are white cards
                            ))}
                        </div>}
                </section>

                {/* Los más reservados del mes */}
                <section>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8 relative inline-block">
                        Tendencia ahora
                        <span className="absolute -bottom-2 left-0 w-1/2 h-2 bg-emerald-400/30 rounded-full"></span>
                    </h2>
                    {loading ? <div className="h-64 bg-zinc-100 rounded-3xl animate-pulse" /> :
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {places.slice(0, 4).map((place) => (
                                <BookedCard key={place._id + 'booked'} place={place} />
                            ))}
                        </div>}
                </section>

                {/* Top 10 La Paz */}
                <section className="bg-black text-white rounded-[2rem] p-8 md:p-20 relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                    <div className="absolute inset-0 bg-[url('/baner.jpg')] bg-cover bg-center opacity-60 group-hover:scale-105 group-hover:opacity-50 transition-all duration-1000" />

                    <div className="relative z-20 max-w-2xl space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-px w-12 bg-white/50"></div>
                            <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">Guía Oficial 2025</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                            TOP 10 <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">LA PAZ.</span>
                        </h2>

                        <p className="text-zinc-300 text-xl font-medium max-w-lg leading-relaxed">
                            La lista definitiva de los lugares que están redefiniendo la gastronomía en la ciudad maravilla.
                        </p>

                        <Button className="bg-white text-black hover:bg-zinc-200 h-14 px-10 rounded-full text-lg font-bold tracking-wide mt-4 transition-transform hover:scale-105">
                            Ver Lista Completa
                        </Button>
                    </div>
                </section>

                {/* Nuevo y digno de atención */}
                <section>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8">Nuevos Ingresos</h2>
                    {loading ? <div className="h-64 bg-zinc-100 rounded-3xl animate-pulse" /> :
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {places.slice(0, 3).map((place) => (
                                <NewPlaceCard key={place._id + 'new'} place={place} />
                            ))}
                        </div>}
                </section>

                {/* Banner Section (Owner) */}
                <section className="bg-zinc-50 rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 border border-zinc-100">
                    <div className="space-y-6 max-w-xl text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900">¿Tienes un restaurante?</h2>
                        <p className="text-zinc-500 text-xl font-medium leading-relaxed">
                            Únete a <span className="text-black font-bold">JIWASA</span>. Conecta con miles de comensales y gestiona tus reservas en tiempo real.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                            <Button className="bg-black text-white hover:bg-zinc-800 h-14 px-8 rounded-full text-base font-bold">
                                Registrar mi negocio
                            </Button>
                            <Button variant="ghost" className="h-14 px-8 rounded-full text-base font-bold hover:bg-zinc-200">
                                Más información
                            </Button>
                        </div>

                    </div>
                    <div className="w-full md:w-96 aspect-square bg-gradient-to-tr from-zinc-200 to-zinc-100 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center">
                        <span className="text-zinc-400 font-black text-9xl select-none opacity-20">J</span>
                    </div>
                </section>

            </div>
        </div >
    );
}

