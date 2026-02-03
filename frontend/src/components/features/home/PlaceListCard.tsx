import Link from "next/link";
import { MapPin, Star } from "lucide-react";

interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
  fotos?: string[];
  promedioRating?: number;
}

interface PlaceListCardProps {
  place: Place;
}

export function PlaceListCard({ place }: PlaceListCardProps) {
  return (
    <Link
      href={`/lugares/${place._id}`}
      className="group flex gap-4 items-start bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-100 group-hover:-translate-y-1"
    >
      <div className="h-24 w-24 rounded-lg overflow-hidden shrink-0 relative bg-zinc-100">
        <img
          src={place.fotos?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60"}
          alt={place.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
          {place.nombre}
        </h3>

        <div className="flex items-center text-xs text-zinc-500 mb-2 mt-1 gap-1">
          <MapPin className="w-3 h-3" />
          <p className="truncate">{place.zona}</p>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100/50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200/50">
            {place.tipo}
          </span>
          {place.promedioRating && (
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-700 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {place.promedioRating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
