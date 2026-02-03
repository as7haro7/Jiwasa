import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
  fotos?: string[];
}

interface NewPlaceCardProps {
  place: Place;
}

export function NewPlaceCard({ place }: NewPlaceCardProps) {
  return (
    <Link href={`/lugares/${place._id}`} className="group h-full block">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col rounded-2xl bg-white group-hover:-translate-y-1">
        <div className="relative aspect-square bg-zinc-100 overflow-hidden">
          <img
            src={place.fotos?.[0] || "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=60"}
            alt={place.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg shadow-blue-600/20">
            NUEVO
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-xl leading-tight text-zinc-900 group-hover:text-blue-700 transition-colors">
              {place.nombre}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide border border-blue-100">
              {place.tipo}
            </span>
            <span className="text-zinc-400 text-xs font-medium">
              {place.zona}
            </span>
          </div>

          <p className="text-sm text-zinc-600 line-clamp-2 mt-auto">
            Descubre esta nueva propuesta que está dando de qué hablar en {place.zona}.
          </p>
        </div>
      </Card>
    </Link>
  );
}
