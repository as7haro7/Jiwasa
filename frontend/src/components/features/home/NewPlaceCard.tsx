import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
}

interface NewPlaceCardProps {
  place: Place;
}

export function NewPlaceCard({ place }: NewPlaceCardProps) {
  return (
    <Link href={`/lugares/${place._id}`} className="group">
      <Card className="overflow-hidden border-0 shadow-none h-full flex flex-col rounded-sm">
        <div className="relative aspect-square bg-zinc-200 rounded-sm overflow-hidden mb-4">
          <div className="absolute top-3 left-3 bg-white px-2 py-1 text-xs font-bold rounded-sm shadow-sm">
            NUEVO
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-xl leading-tight group-hover:underline decoration-2">
            {place.nombre}
          </h3>
          <p className="text-zinc-500 text-sm">
            {place.zona} • {place.tipo}
          </p>
          <p className="text-sm pt-2 line-clamp-2 text-zinc-600">
            Una nueva propuesta gastronómica que fusiona sabores tradicionales...
          </p>
        </div>
      </Card>
    </Link>
  );
}
