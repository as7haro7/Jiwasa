import Link from "next/link";

interface Place {
  _id: string;
  nombre: string;
  zona: string;
  fotos?: string[];
}

interface BookedCardProps {
  place: Place;
}

export function BookedCard({ place }: BookedCardProps) {
  return (
    <Link href={`/lugares/${place._id}`} className="group block">
      <div className="relative aspect-video bg-zinc-200 rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-300">
         <img 
            src={place.fotos?.[0] || "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=500&auto=format&fit=crop&q=60"} 
            alt={place.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
         />
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 text-[10px] font-bold rounded-full border border-white/10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
          Top Reservas
        </div>
      </div>
      
      <div className="px-1">
        <h3 className="font-bold text-lg text-zinc-900 group-hover:text-emerald-700 transition-colors">
            {place.nombre}
        </h3>
        <div className="flex items-center text-sm text-zinc-500 gap-2 mt-0.5">
            <span>{place.zona}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300"/>
            <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-1.5 rounded-md">Muy solicitado</span>
        </div>
      </div>
    </Link>
  );
}
