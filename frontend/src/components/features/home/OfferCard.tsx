import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Star } from "lucide-react";

interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
  promedioRating: number;
}

interface OfferCardProps {
  place: Place;
  discount?: string;
}

export function OfferCard({ place, discount = "-20% en carta" }: OfferCardProps) {
  return (
    <Link href={`/lugares/${place._id}`} className="group h-full">
      <Card className="overflow-hidden border-0 shadow-none hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-sm">
        <div className="h-40 w-full bg-zinc-200 relative overflow-hidden">
          {/* Promo Badge */}
          <div className="absolute top-2 left-2 bg-[#5ba829] text-white px-2 py-1 text-xs font-bold rounded-sm">
            {discount}
          </div>
        </div>
        <CardContent className="p-4 flex-1">
          <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-[#5ba829] transition-colors">
            {place.nombre}
          </h3>
          <p className="text-sm text-zinc-500">
            {place.tipo} • {place.zona}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold">{place.promedioRating.toFixed(1)}</span>
            <span className="text-xs text-zinc-400">(120 opiniones)</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
