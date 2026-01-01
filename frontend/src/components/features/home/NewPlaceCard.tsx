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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-[10px] font-bold tracking-widest rounded-full shadow-lg">
            NUEVO
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
             <h3 className="font-bold text-xl leading-tight text-zinc-900 group-hover:text-blue-700 transition-colors">
                {place.nombre}
             </h3>
          </div>
          
          <p className="text-zinc-500 text-sm mb-3 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/>
             {place.zona} • <span className="capitalize">{place.tipo}</span>
          </p>
          
          <p className="text-sm text-zinc-600 line-clamp-2 mt-auto">
             Descubre esta nueva propuesta que está dando de qué hablar en {place.zona}.
          </p>
        </div>
      </Card>
    </Link>
  );
}
