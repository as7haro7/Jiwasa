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
      <div className="relative aspect-video bg-zinc-100 rounded-2xl overflow-hidden mb-3 shadow-md group-hover:shadow-2xl transition-all duration-500 ease-out">
        <img
          src={place.fotos?.[0] || "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=500&auto=format&fit=crop&q=60"}
          alt={place.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-800 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Top Reservas
        </div>
      </div>

      <div className="px-1">
        <h3 className="font-bold text-lg text-zinc-900 group-hover:text-emerald-700 transition-colors">
          {place.nombre}
        </h3>
        <div className="flex items-center text-sm text-zinc-500 gap-2 mt-0.5">
          <span>{place.zona}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-300" />
          <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-1.5 rounded-md">Muy solicitado</span>
        </div>
      </div>
    </Link>
  );
}
