import Link from "next/link";
interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
}

interface PlaceListCardProps {
  place: Place;
}

export function PlaceListCard({ place }: PlaceListCardProps) {
  return (
    <Link
      href={`/lugares/${place._id}`}
      className="group flex gap-4 items-center bg-white p-4 rounded-sm shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="h-24 w-24 bg-zinc-200 rounded-sm shrink-0" />
      <div>
        <h3 className="font-bold group-hover:underline decoration-2 underline-offset-4">
          {place.nombre}
        </h3>
        <p className="text-sm text-zinc-500 mb-2">{place.zona}</p>
        <div className="inline-flex items-center px-2 py-1 rounded-sm bg-zinc-100 text-xs font-medium">
          {place.tipo}
        </div>
      </div>
    </Link>
  );
}
