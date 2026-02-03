"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import PlaceForm from "@/components/features/places/PlaceForm";
import MenuManager from "@/components/features/places/MenuManager";
import PromotionManager from "@/components/features/places/PromotionManager";
import ReviewsManager from "@/components/features/places/ReviewsManager";
import { Store, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface EditPlacePageProps {
    params: Promise<{
        id: string;
    }>
}

export default function EditPlacePage({ params }: EditPlacePageProps) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(initialTab || "general");
    const [place, setPlace] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const { data } = await api.get(`/lugares/${id}`);
                setPlace(data);
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar la información del lugar.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlace();
        }
    }, [id]);

    if (loading) {
        return <div className="flex h-[50vh] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg max-w-2xl mx-auto mt-12">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <Store className="h-8 w-8 text-[#007068]" /> Editar Lugar
                </h1>
                <p className="text-zinc-500">
                    Actualiza la información de tu establecimiento.
                </p>
            </div>

            {place && (
                <div className="space-y-6">
                    <div className="flex border-b border-zinc-200">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "general"
                                ? "border-[#007068] text-[#007068]"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                                }`}
                        >
                            Información General
                        </button>
                        <button
                            onClick={() => setActiveTab("menu")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "menu"
                                ? "border-[#007068] text-[#007068]"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                                }`}
                        >
                            Menú
                        </button>
                        <button
                            onClick={() => setActiveTab("promociones")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "promociones"
                                ? "border-[#007068] text-[#007068]"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                                }`}
                        >
                            Promociones
                        </button>
                        <button
                            onClick={() => setActiveTab("resenas")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "resenas"
                                ? "border-[#007068] text-[#007068]"
                                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                                }`}
                        >
                            Reseñas y Estadísticas
                        </button>
                    </div>

                    <div className="bg-white p-1">
                        {activeTab === "general" && <PlaceForm initialData={place} isEditing={true} />}
                        {activeTab === "menu" && <MenuManager placeId={place._id} />}
                        {activeTab === "promociones" && <PromotionManager placeId={place._id} />}
                        {activeTab === "resenas" && (
                            <ReviewsManager
                                placeId={place._id}
                                promedioRating={place.promedioRating}
                                cantidadResenas={place.cantidadResenas}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
