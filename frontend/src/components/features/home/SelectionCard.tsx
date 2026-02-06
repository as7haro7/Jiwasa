import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";

interface Place {
    _id: string;
    nombre: string;
    tipo: string;
    zona: string;
    fotos?: string[];
    promedioRating?: number;
}

interface SelectionCardProps {
    place: Place;
}

export function SelectionCard({ place }: SelectionCardProps) {
    return (
        <Link
            href={`/lugares/${place._id}`}
            className="group relative flex flex-col h-[400px] w-full rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={place.fotos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60"}
                    alt={place.nombre}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {/* Type Badge */}
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-white bg-emerald-500/80 backdrop-blur-sm rounded-full">
                        {place.tipo}
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight group-hover:text-emerald-300 transition-colors">
                        {place.nombre}
                    </h3>

                    {/* Zone & Rating */}
                    <div className="flex items-center justify-between text-zinc-300 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span>{place.zona}</span>
                        </div>
                        {place.promedioRating && (
                            <div className="flex items-center gap-1.5 text-amber-400">
                                <Star className="w-4 h-4 fill-amber-400" />
                                <span>{place.promedioRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {/* Arrow Action */}
                    <div className="mt-6 flex items-center gap-2 text-emerald-300 font-bold text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        Ver detalles <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
