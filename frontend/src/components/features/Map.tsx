"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "../ui/Button";
import Link from "next/link";
import { renderToStaticMarkup } from "react-dom/server";
import { Utensils, Coffee, ShoppingBag, Store, Soup, MapPin, User } from "lucide-react";



interface Place {
  _id: string;
  nombre: string;
  coordenadas: {
    coordinates: [number, number]; // [lng, lat]
  };
  tipo: string;
  fotos?: string[];
  direccion?: string;
  zona?: string;
  promedioRating?: number;
}

interface MapProps {
  places: Place[];
  userLocation?: [number, number] | null;
  radius?: number; // km
}

// Helper to get color and icon based on type
const getMarkerStyle = (tipo: string) => {
  const normalizedType = tipo?.toLowerCase() || "";
  if (normalizedType.includes("restaurante")) return { color: "bg-orange-500", icon: <Utensils className="w-4 h-4 text-white" /> };
  if (normalizedType.includes("caf")) return { color: "bg-stone-500", icon: <Coffee className="w-4 h-4 text-white" /> };
  if (normalizedType.includes("mercado")) return { color: "bg-emerald-600", icon: <Store className="w-4 h-4 text-white" /> };
  if (normalizedType.includes("callejero")) return { color: "bg-yellow-500", icon: <ShoppingBag className="w-4 h-4 text-white" /> };
  if (normalizedType.includes("tradicional")) return { color: "bg-red-500", icon: <Soup className="w-4 h-4 text-white" /> };
  
  return { color: "bg-black", icon: <MapPin className="w-4 h-4 text-white" /> };
};

const createCustomIcon = (tipo: string) => {
  const { color, icon } = getMarkerStyle(tipo);
  const iconMarkup = renderToStaticMarkup(icon);
  
  const html = `
    <div class="relative flex flex-col items-center justify-center transform hover:scale-110 transition-transform duration-200">
      <div class="${color} p-2 rounded-full shadow-lg border-2 border-white mb-[-5px] z-10 w-8 h-8 flex items-center justify-center">
        ${iconMarkup}
      </div>
      <div class="w-2 h-2 bg-white transform rotate-45 shadow-sm mt-[-4px] border-r border-b border-zinc-200"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "bg-transparent border-0", 
    iconSize: [32, 40],
    iconAnchor: [16, 40], 
    popupAnchor: [0, -36]
  });
};

const createUserIcon = () => {
  // Larger, more eye-catching pulsing dot
  const html = `
    <div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
      <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-[3px] border-white shadow-xl"></span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "bg-transparent border-0",
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Center
    popupAnchor: [0, -16]
  });
};

// Component to handle map center updates
const MapUpdater = ({ center, zoom, radius }: { center: [number, number], zoom: number, radius?: number }) => {
  const map = useMap();
  useEffect(() => {
    // Prevent animation clash on mount
    const timer = setTimeout(() => {
        // Check if we are already close enough to avoid vibration/unnecessary moves
        const currentCenter = map.getCenter();
        const targetCenter = L.latLng(center);
        const distance = currentCenter.distanceTo(targetCenter); // in meters
        const isZoomCorrect = map.getZoom() === zoom;

        // If within 10 meters and zoom is correct, skip animation (unless radius requires fitting bounds)
        if (distance < 10 && isZoomCorrect && !radius) return;

        if (radius) {
             const circle = L.circle(center, { radius: radius * 1000 });
             circle.addTo(map);
             const bounds = circle.getBounds();
             circle.remove();
             
             map.flyToBounds(bounds, {
                 duration: 1.5,
                 padding: [5, 5]
             });
        } else {
             map.flyTo(center, zoom, {
                duration: 1.5
             });
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [center, zoom, map, radius]);
  return null;
};

export default function Map({ places, userLocation, radius }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize center calculation to prevent MapUpdater re-triggering on every render
  const { activeCenter, activeZoom, shouldUpdateView } = useMemo(() => {
      let center: [number, number] = [-16.5000, -68.1193]; // Default La Paz
      let zoom = 14;
      let shouldUpdate = false;

      if (userLocation) {
          center = [userLocation[0], userLocation[1]];
          zoom = 15;
          shouldUpdate = true;
      } else if (places.length === 1) {
          // Focus on single place (Detail View)
          center = [places[0].coordenadas.coordinates[1], places[0].coordenadas.coordinates[0]];
          zoom = 16;
          shouldUpdate = true;
      }
      
      return { activeCenter: center, activeZoom: zoom, shouldUpdateView: shouldUpdate };
  }, [userLocation, places]); // Dependencies

  if (!mounted) {
    return <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center text-zinc-400">Cargando mapa...</div>;
  }

  return (
    <MapContainer
      center={activeCenter}
      zoom={activeZoom}
      scrollWheelZoom={true}
      className="h-full w-full z-0 rounded-lg"
    >
      {/* Update view when userLocation or single place changes */}
      {shouldUpdateView && <MapUpdater center={activeCenter} zoom={activeZoom} radius={radius} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User Location Marker */}
      {userLocation && (
          <Marker position={[userLocation[0], userLocation[1]]} icon={createUserIcon()}>
              <Popup>¡Estás aquí!</Popup>
          </Marker>
      )}

      {places.map((place) => (
        <Marker
          key={place._id}
          position={[place.coordenadas.coordinates[1], place.coordenadas.coordinates[0]]}
          icon={createCustomIcon(place.tipo)}
        >
          <Popup className="min-w-[200px]">
             {/* ... popup content same as before ... */}
             <div className="flex flex-col gap-2 p-1">
                {place.fotos && place.fotos.length > 0 && (
                  <div className="relative w-full h-24 rounded-md overflow-hidden mb-1">
                     <img src={place.fotos[0]} alt={place.nombre} className="object-cover w-full h-full" />
                  </div>
                )}
                
                <div>
                   <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-tight">{place.nombre}</h3>
                      {place.promedioRating ? (
                         <div className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-1 rounded">
                            <span>★ {place.promedioRating}</span>
                         </div>
                      ) : null}
                   </div>
                   
                   <p className="text-xs text-emerald-700 font-medium capitalize mt-0.5">{place.tipo}</p>
                   
                   {(place.direccion || place.zona) && (
                      <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">
                         {place.direccion}{place.zona ? `, ${place.zona}` : ''}
                      </p>
                   )}
                </div>

                <Link href={`/lugares/${place._id}`} className="w-full">
                    <Button className="h-7 text-xs w-full bg-black text-white hover:bg-zinc-800">Ver detalle</Button>
                </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
