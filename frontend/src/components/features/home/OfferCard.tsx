import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, MapPin } from "lucide-react";

interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
  fotos?: string[];
  promedioRating: number;
}

interface OfferCardProps {
  place: Place;
  discount?: string;
}

export function OfferCard({ place, discount = "20% OFF" }: OfferCardProps) {
  return (
    <Link href={`/lugares/${place._id}`} className="group h-full block">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col rounded-2xl bg-white group-hover:-translate-y-1">
        <div className="h-56 w-full bg-zinc-100 relative overflow-hidden">

          <img
            src={place.fotos?.[0] || "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"}
            alt={place.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

          {/* Promo Badge */}
          <div className="absolute top-4 left-4 bg-white text-rose-600 px-3 py-1 text-xs font-black tracking-wider uppercase rounded-full shadow-lg">
            {discount}
          </div>

          {place.promedioRating && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-bold text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 group-hover:bg-emerald-600/90 group-hover:border-emerald-500/50 transition-colors">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {place.promedioRating.toFixed(1)}
            </div>
          )}
        </div>

        <CardContent className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{place.tipo}</p>
            </div>

            <h3 className="font-bold text-xl leading-tight mb-2 text-zinc-900 group-hover:text-emerald-700 transition-colors">
              {place.nombre}
            </h3>

            <div className="flex items-center text-sm text-zinc-500 gap-1 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              {place.zona}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 w-full">
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
              Oferta exclusiva web
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
