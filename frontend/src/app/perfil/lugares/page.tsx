"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import api from "@/lib/api";
import { Plus, Edit, Trash2, MapPin, Star, AlertCircle, Store, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getFullImageUrl } from "@/lib/utils";

interface Place {
    _id: string; // or id, based on backend mapping
    nombre: string;
    direccion: string;
    zona: string;
    tipo: string;
    fotos: string[];
    promedioRating: number;
    estado: "activo" | "cerrado" | "pendiente";
}

export default function MyPlacesPage() {
    const router = useRouter();
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // If we don't have userId yet, fetch it first
                let currentUserId = userId;
                if (!currentUserId) {
                    const userRes = await api.get("/users/me");
                    currentUserId = userRes.data._id || userRes.data.id;
                    setUserId(currentUserId);
                }

                if (!currentUserId) return;

                const queryParams = new URLSearchParams();
                queryParams.append("propietarioId", currentUserId);
                queryParams.append("pageNumber", page.toString());
                if (debouncedSearch) queryParams.append("keyword", debouncedSearch);

                const placesRes = await api.get(`/lugares?${queryParams.toString()}`);

                // Check response format (depending on controller update status)
                if (placesRes.data.places) {
                    setPlaces(placesRes.data.places);
                    setTotalPages(placesRes.data.pages || 1);
                } else if (Array.isArray(placesRes.data)) {
                    // Fallback for unpaginated
                    setPlaces(placesRes.data);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Error fetching places:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [debouncedSearch, page]); // Removed empty dependency array to react to changes

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de querer cerrar este lugar?")) return;
        try {
            await api.delete(`/lugares/${id}`);
            // Update state to reflect status change or remove
            setPlaces(prev => prev.map(p => p._id === id ? { ...p, estado: "cerrado" } : p));
        } catch (error) {
            console.error("Error deleting place", error);
        }
    };



    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Store className="h-8 w-8 text-[#007068]" /> Mis Lugares
                    </h1>
                    <p className="text-zinc-500 mt-1">Administra tus restaurantes y establecimientos.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <PlaceSearchBar onSearch={setDebouncedSearch} loading={loading} />

                    <Button
                        className="bg-[#007068] hover:bg-[#005a54] text-white shrink-0"
                        onClick={() => router.push("/perfil/lugares/nuevo")}
                    >
                        <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Crear Nuevo</span><span className="sm:hidden">Nuevo</span>
                    </Button>
                </div>
            </div>

            {places.length === 0 ? (
                <Card className="border-dashed border-zinc-300 bg-zinc-50 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Store className="h-12 w-12 text-zinc-300 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900">
                            {debouncedSearch ? "No se encontraron lugares." : "No tienes lugares registrados"}
                        </h3>
                        <p className="text-zinc-500 max-w-sm mt-1 mb-6">
                            {debouncedSearch ? "Intenta con otra búsqueda." : "Empieza a publicar tus establecimientos para que los usuarios puedan encontrarlos."}
                        </p>
                        {!debouncedSearch && (
                            <Button
                                className="bg-black text-white hover:bg-zinc-800"
                                onClick={() => router.push("/perfil/lugares/nuevo")}
                            >
                                Registrar mi primer lugar
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {places.map((place) => (
                            <Card key={place._id} className="overflow-hidden border-zinc-200 hover:shadow-lg transition-shadow group">
                                <div className="h-48 bg-zinc-100 relative overflow-hidden">
                                    {place.fotos && place.fotos.length > 0 ? (
                                        <img
                                            src={place.fotos[0]} // Use getFullImageUrl if needed, but usually URLs are absolute or handled
                                            alt={place.nombre}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-zinc-300 bg-zinc-50">
                                            <Store className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={
                                            `px-2 py-1 text-xs font-bold rounded-full border shadow-sm ${place.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                place.estado === 'pendiente' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                            }`
                                        }>
                                            {place.estado.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex justify-between items-start">
                                        <span className="truncate">{place.nombre}</span>
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 text-xs">
                                        <MapPin className="h-3 w-3" /> {place.zona}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4 pt-2 text-sm">
                                    <div className="flex justify-between items-center text-zinc-600 mb-2">
                                        <span className="bg-zinc-100 px-2 py-0.5 rounded text-xs">{place.tipo}</span>
                                        <div className="flex items-center gap-1 text-amber-500 font-medium">
                                            <Star className="h-3 w-3 fill-current" /> {place.promedioRating}
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-xs line-clamp-2">{place.direccion}</p>
                                </CardContent>
                                <CardFooter className="pt-0 gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-xs h-8 border-zinc-200 hover:bg-zinc-50"
                                        onClick={() => router.push(`/perfil/lugares/editar/${place._id}`)}
                                    >
                                        <Edit className="mr-1.5 h-3 w-3" /> Editar
                                    </Button>
                                    {place.estado !== 'cerrado' && (
                                        <Button
                                            variant="outline"
                                            className="flex-1 text-xs h-8 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => handleDelete(place._id)}
                                        >
                                            <Trash2 className="mr-1.5 h-3 w-3" /> Cerrar
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                            </Button>
                            <span className="text-sm font-medium text-zinc-600">
                                Página {page} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
const PlaceSearchBar = ({ onSearch, loading }: { onSearch: (term: string) => void, loading: boolean }) => {
    const [term, setTerm] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!touched) return;
        const timer = setTimeout(() => {
            onSearch(term);
        }, 500);
        return () => clearTimeout(timer);
    }, [term, onSearch, touched]);

    return (
        <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
                placeholder="Buscar lugar..."
                value={term}
                onChange={(e) => {
                    setTerm(e.target.value);
                    setTouched(true);
                }}
                className="pl-9 bg-white"
            />
            {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-[#007068]" />}
        </div>
    );
};
