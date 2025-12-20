"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "../ui/Button";
import Link from "next/link";

// Fix Leaflet icon issue in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Place {
  _id: string;
  nombre: string;
  coordenadas: {
    coordinates: [number, number]; // [lng, lat]
  };
  tipo: string;
}

interface MapProps {
  places: Place[];
}

export default function Map({ places }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center text-zinc-400">Cargando mapa...</div>;
  }

  return (
    <MapContainer
      center={[-16.5000, -68.1193]} // La Paz Center
      zoom={14}
      scrollWheelZoom={true}
      className="h-full w-full z-0 rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place) => (
        <Marker
          key={place._id}
          position={[place.coordenadas.coordinates[1], place.coordenadas.coordinates[0]]} // Leaflet uses [lat, lng]
        >
          <Popup>
            <div className="text-center">
                <h3 className="font-bold text-sm mb-1">{place.nombre}</h3>
                <p className="text-xs text-zinc-500 mb-2 capitalize">{place.tipo}</p>
                <Link href={`/lugares/${place._id}`}>
                    <Button className="h-6 text-[10px] px-2 w-full">Ver detalle</Button>
                </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
