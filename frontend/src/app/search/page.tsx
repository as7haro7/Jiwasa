"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { SelectionCard } from "@/components/features/home/SelectionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, X, MapPin, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Place {
    _id: string;
    nombre: string;
    tipo: string;
    zona: string;
    fotos?: string[];
    promedioRating?: number;
    rangoPrecios?: string;
    tiposComida?: string[];
}

// Filter Options
const CATEGORIES = ["Todos", "Restaurante", "Café", "Bar", "Comida Rápida", "Mercado", "Callejero"];
const ZONES = ["Todas", "Sur", "Sopocachi", "Centro", "Miraflores", "San Miguel"];

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Search & Filter State
    const [keyword, setKeyword] = useState(searchParams.get("q") || "");
    const [selectedType, setSelectedType] = useState(searchParams.get("tipo") || "Todos");
    const [selectedZone, setSelectedZone] = useState(searchParams.get("zona") || "Todas");

    // Suggestions State
    const [suggestions, setSuggestions] = useState<Place[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Debounce Logic for Suggestions could go here, but for now simple checks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync State with URL
    useEffect(() => {
        setKeyword(searchParams.get("q") || "");
        const typeParam = searchParams.get("tipo");
        setSelectedType(typeParam && typeParam !== "" ? typeParam : "Todos");

        const zoneParam = searchParams.get("zona");
        setSelectedZone(zoneParam && zoneParam !== "" ? zoneParam : "Todas");
    }, [searchParams]);

    // Fetch Results
    useEffect(() => {
        fetchResults();
    }, [searchParams]);

    // Fetch Suggestions when typing
    useEffect(() => {
        if (keyword.length > 2) {
            const fetchSuggestions = async () => {
                try {
                    const { data } = await api.get("/lugares", { params: { keyword, limit: 5 } });
                    setSuggestions(data.places || []);
                    setShowSuggestions(true);
                } catch (e) {
                    console.error("Error fetching suggestions", e);
                }
            };
            const timer = setTimeout(fetchSuggestions, 300);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [keyword]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const params: any = {};
            const q = searchParams.get("q");
            const tipo = searchParams.get("tipo");
            const zona = searchParams.get("zona");

            if (q) params.keyword = q;
            if (tipo && tipo !== "Todos") params.tipo = tipo;
            if (zona && zona !== "Todas") params.zona = zona;

            const { data } = await api.get("/lugares", { params });
            setPlaces(data.places || []);
        } catch (error) {
            console.error("Error searching places", error);
        } finally {
            setLoading(false);
        }
    };

    const updateURL = (newKeyword?: string, newType?: string, newZone?: string) => {
        const params = new URLSearchParams();

        const k = newKeyword !== undefined ? newKeyword : keyword;
        const t = newType !== undefined ? newType : selectedType;
        const z = newZone !== undefined ? newZone : selectedZone;

        if (k) params.set("q", k);
        if (t && t !== "Todos") params.set("tipo", t);
        if (z && z !== "Todas") params.set("zona", z);

        router.push(`/search?${params.toString()}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        updateURL();
    };

    const clearFilters = () => {
        setKeyword("");
        setSelectedType("Todos");
        setSelectedZone("Todas");
        router.push("/search");
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            {/* Sticky Header with Search & Chips */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200 supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 py-4 space-y-4">

                    {/* Top Row: Search Bar */}
                    <div className="flex items-center gap-3 relative max-w-4xl mx-auto w-full" ref={searchContainerRef}>
                        <form onSubmit={handleSearchSubmit} className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                            </div>
                            <Input
                                className="w-full h-12 pl-12 pr-4 bg-zinc-100/50 border-transparent focus:bg-white focus:border-zinc-200 focus:ring-4 focus:ring-emerald-100 rounded-2xl transition-all shadow-sm text-lg"
                                placeholder="Buscar lugares, antojos, zonas..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onFocus={() => keyword.length > 2 && setShowSuggestions(true)}
                            />
                            {keyword && (
                                <button
                                    type="button"
                                    onClick={() => { setKeyword(""); updateURL(""); }}
                                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </form>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-2 p-2">
                                <div className="text-xs font-bold text-zinc-400 px-3 py-2 uppercase tracking-wider">Sugerencias</div>
                                {suggestions.map(place => (
                                    <div
                                        key={place._id}
                                        onClick={() => router.push(`/lugares/${place._id}`)}
                                        className="flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden relative">
                                            <img src={place.fotos?.[0] || ""} alt={place.nombre} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-zinc-900 group-hover:text-emerald-700">{place.nombre}</div>
                                            <div className="text-xs text-zinc-500">{place.zona} • {place.tipo}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Mobile Filter Toggle */}
                        <Button
                            className="md:hidden h-12 w-12 rounded-2xl bg-black text-white p-0 shrink-0"
                            onClick={() => setIsMobileFiltersOpen(true)}
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Bottom Row: Filter Chips (Horizontal Scroll) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar mask-gradient-right">

                        {/* Category Chips */}
                        <div className="flex items-center gap-2 pr-4 border-r border-zinc-200 mr-2 shrink-0">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => updateURL(undefined, cat, undefined)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border",
                                        selectedType === cat
                                            ? "bg-black text-white border-black shadow-lg shadow-zinc-900/10 scale-105"
                                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Zone Chips */}
                        {ZONES.map(zone => (
                            <button
                                key={zone}
                                onClick={() => updateURL(undefined, undefined, zone)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-1.5",
                                    selectedZone === zone
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20"
                                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                )}
                            >
                                {zone !== "Todas" && <MapPin className="h-3 w-3" />}
                                {zone}
                            </button>
                        ))}

                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 flex-1">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                            Explorar <span className="text-lg font-bold text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">{loading ? "..." : places.length}</span>
                        </h1>
                        <p className="text-zinc-500 font-medium mt-1">
                            {selectedType !== "Todos" ? selectedType : "Todos los lugares"} en {selectedZone !== "Todas" ? selectedZone : "toda la ciudad"}
                        </p>
                    </div>
                    {/* Sort Dropdown could go here */}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-[400px] w-full rounded-3xl bg-zinc-200 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                            </div>
                        ))}
                    </div>
                ) : places.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {places.map(place => (
                            <SelectionCard key={place._id} place={place} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="h-10 w-10 text-zinc-300" />
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 mb-2">No encontramos resultados</h2>
                        <p className="text-zinc-500 max-w-md mx-auto mb-8 text-lg">
                            Intenta ajustar tus filtros o buscar con otra palabra clave.
                        </p>
                        <Button
                            onClick={clearFilters}
                            className="h-12 px-8 rounded-full bg-black text-white hover:bg-zinc-800 text-base font-bold shadow-xl shadow-zinc-900/10"
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                )}
            </main>

            {/* Mobile Filters Modal */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black">Filtros</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)} className="rounded-full hover:bg-zinc-100">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Categoría</h3>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.filter(c => c !== "Todos").map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => updateURL(undefined, selectedType === cat ? "Todos" : cat, undefined)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                                                selectedType === cat ? "bg-black text-white border-black" : "bg-white text-zinc-600 border-zinc-200"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Zona</h3>
                                <div className="flex flex-wrap gap-2">
                                    {ZONES.filter(z => z !== "Todas").map(zone => (
                                        <button
                                            key={zone}
                                            onClick={() => updateURL(undefined, undefined, selectedZone === zone ? "Todas" : zone)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                                                selectedZone === zone ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-zinc-600 border-zinc-200"
                                            )}
                                        >
                                            {zone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-zinc-100 flex gap-3">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}>
                                Limpiar
                            </Button>
                            <Button className="flex-1 h-12 rounded-xl bg-black text-white hover:bg-zinc-800 font-bold shadow-lg" onClick={() => setIsMobileFiltersOpen(false)}>
                                Ver resultados
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div></div>}>
            <SearchResults />
        </Suspense>
    );
}
