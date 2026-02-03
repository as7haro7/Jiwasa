"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { PlaceListCard } from "@/components/features/home/PlaceListCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, X } from "lucide-react";

// Checking current Shadcn: I see Button, Input, Card. I'll stick to a simple mobile filter toggle state if Sheet isn't verified.
// Actually, I'll stick to a custom mobile overlay to avoid "module not found" if Sheet is missing.

interface Place {
    _id: string;
    nombre: string;
    tipo: string;
    zona: string;
    fotos: string[];
    promedioRating: number;
    coordenadas: { coordinates: [number, number] };
    rangoPrecios?: string;
    tiposComida?: string[];
}

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter States
    const [keyword, setKeyword] = useState(searchParams.get("q") || "");
    const [selectedType, setSelectedType] = useState(searchParams.get("tipo") || "");
    const [selectedZone, setSelectedZone] = useState(searchParams.get("zona") || "");

    // Sync keyword with URL if it changes outside
    useEffect(() => {
        setKeyword(searchParams.get("q") || "");
        setSelectedType(searchParams.get("tipo") || "");
        setSelectedZone(searchParams.get("zona") || "");
    }, [searchParams]);

    useEffect(() => {
        fetchResults();
    }, [searchParams]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const params: any = {};
            const q = searchParams.get("q");
            const tipo = searchParams.get("tipo");
            const zona = searchParams.get("zona");

            if (q) params.keyword = q;
            if (tipo) params.tipo = tipo;
            if (zona) params.zona = zona;

            const { data } = await api.get("/lugares", { params });
            setPlaces(data.places || []);
        } catch (error) {
            console.error("Error searching places", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters();
    };

    const updateFilters = () => {
        const params = new URLSearchParams();
        if (keyword) params.set("q", keyword);
        if (selectedType) params.set("tipo", selectedType);
        if (selectedZone) params.set("zona", selectedZone);

        router.push(`/search?${params.toString()}`);
        setShowFilters(false); // Close mobile filters on submit
    };

    const clearFilters = () => {
        setKeyword("");
        setSelectedType("");
        setSelectedZone("");
        router.push("/search");
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* Header / Search Bar */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Buscar restaurantes, platos..."
                                className="pl-10 h-11 bg-zinc-50 border-zinc-200"
                            />
                        </div>
                        <Button type="submit" className="h-11 bg-black text-white px-6">Buscar</Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 md:hidden"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-start">

                {/* Desktop Sidebar Filters */}
                <aside className="hidden md:block w-64 shrink-0 space-y-8 sticky top-28">
                    <div>
                        <h3 className="font-bold mb-4">Categoría</h3>
                        <div className="space-y-2">
                            {["Restaurante", "Café", "Bar", "Comida Rápida", "Mercado"].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-600 hover:text-black">
                                    <input
                                        type="radio"
                                        name="tipo"
                                        checked={selectedType.toLowerCase() === type.toLowerCase()}
                                        onChange={() => {
                                            setSelectedType(type.toLowerCase());
                                            // Auto update or wait for button? Let's auto update for sidebar
                                            const params = new URLSearchParams(searchParams);
                                            params.set("tipo", type.toLowerCase());
                                            router.push(`/search?${params.toString()}`);
                                        }}
                                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Zona</h3>
                        {/* This could be dynamic in future */}
                        <div className="space-y-2">
                            {["Sur", "Sopocachi", "Centro", "Miraflores"].map(zona => (
                                <label key={zona} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-600 hover:text-black">
                                    <input
                                        type="radio"
                                        name="zona"
                                        checked={selectedZone.toLowerCase() === zona.toLowerCase()}
                                        onChange={() => {
                                            setSelectedZone(zona.toLowerCase());
                                            const params = new URLSearchParams(searchParams);
                                            params.set("zona", zona.toLowerCase());
                                            router.push(`/search?${params.toString()}`);
                                        }}
                                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
                                    />
                                    {zona}
                                </label>
                            ))}
                        </div>
                    </div>

                    {(selectedType || selectedZone || keyword) && (
                        <Button variant="ghost" onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 p-0 h-auto">
                            Limpiar filtros
                        </Button>
                    )}
                </aside>

                {/* Mobile Filters Overlay */}
                {showFilters && (
                    <div className="fixed inset-0 bg-white z-[50] p-6 flex flex-col md:hidden animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Filtros via App</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="space-y-6 flex-1 overflow-y-auto">
                            <div>
                                <h3 className="font-bold mb-3">Categoría</h3>
                                <div className="space-y-3">
                                    {["Restaurante", "Café", "Bar", "Comida Rápida"].map(type => (
                                        <label key={type} className="flex items-center gap-3 p-3 border border-zinc-100 rounded-xl">
                                            <input
                                                type="radio"
                                                name="mobile-tipo"
                                                checked={selectedType.toLowerCase() === type.toLowerCase()}
                                                onChange={() => setSelectedType(type.toLowerCase())}
                                                className="h-5 w-5"
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-3">Zona</h3>
                                <div className="space-y-3">
                                    {["Sur", "Sopocachi", "Centro", "Miraflores"].map(zona => (
                                        <label key={zona} className="flex items-center gap-3 p-3 border border-zinc-100 rounded-xl">
                                            <input
                                                type="radio"
                                                name="mobile-zona"
                                                checked={selectedZone.toLowerCase() === zona.toLowerCase()}
                                                onChange={() => setSelectedZone(zona.toLowerCase())}
                                                className="h-5 w-5"
                                            />
                                            {zona}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-zinc-100 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={clearFilters}>Limpiar</Button>
                            <Button className="flex-1 bg-black text-white" onClick={updateFilters}>Aplicar</Button>
                        </div>
                    </div>
                )}


                {/* Results Grid */}
                <div className="flex-1">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-zinc-900">
                            {places.length > 0 ? `Resultados: ${places.length} lugares` : "Explora lugares"}
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            {keyword ? `Búsqueda: "${keyword}"` : "Todos los lugares"}
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-72 bg-zinc-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : places.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {places.map(place => (
                                <PlaceListCard key={place._id} place={place} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
                            <Search className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900">No encontramos resultados</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto mt-2">Intenta con otros términos o limpia los filtros para ver más opciones.</p>
                            <Button variant="outline" className="mt-6" onClick={clearFilters}>Ver todo</Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
            <SearchResults />
        </Suspense>
    );
}
