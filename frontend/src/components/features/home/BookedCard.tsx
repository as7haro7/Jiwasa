import Link from "next/link";

interface Place {
  _id: string;
  nombre: string;
  zona: string;
}

interface BookedCardProps {
  place: Place;
}

export function BookedCard({ place }: BookedCardProps) {
  return (
    <Link href={`/lugares/${place._id}`} className="group">
      <div className="relative aspect-video bg-zinc-200 rounded-sm overflow-hidden mb-3">
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-[10px] font-bold rounded-sm backdrop-blur-sm">
          Top Reservas
        </div>
      </div>
      <h3 className="font-bold text-lg group-hover:text-[#5ba829] transition-colors">
        {place.nombre}
      </h3>
      <div className="flex items-center text-sm text-zinc-500 gap-2">
        <span>{place.zona}</span>
        <span>•</span>
        <span className="text-[#5ba829] font-medium">Precio medio 45 Bs.</span>
      </div>
    </Link>
  );
}
