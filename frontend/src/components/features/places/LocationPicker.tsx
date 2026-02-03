"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/Button";
import { MapPin, Crosshair } from "lucide-react";

// Fix Leaflet marker icon issue
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface LocationPickerProps {
    value: { lat: number, lng: number };
    onChange: (coords: { lat: number, lng: number }) => void;
}

function MapEvents({ onChange }: { onChange: (coords: { lat: number, lng: number }) => void }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    const [position, setPosition] = useState(value);

    // Update local state if props change (e.g. from initial load)
    // Update local state if props change (e.g. from initial load)
    useEffect(() => {
        if (value.lat && value.lng) {
            setPosition(value);
        }
    }, [value.lat, value.lng]);

    function MapUpdater({ center }: { center: { lat: number, lng: number } }) {
        const map = useMapEvents({});
        useEffect(() => {
            map.flyTo([center.lat, center.lng], map.getZoom());
        }, [center, map]);
        return null;
    }

    const handleLocationFound = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(newPos);
                onChange(newPos);
            });
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Haz click en el mapa para marcar la ubicación.</span>
                <Button type="button" size="sm" variant="outline" onClick={handleLocationFound} className="text-xs h-8">
                    <Crosshair className="w-3 h-3 mr-1" /> Usar mi ubicación
                </Button>
            </div>

            <div className="h-[300px] w-full rounded-md overflow-hidden border border-zinc-200 relative z-0">
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={15}
                    className="h-full w-full"
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <MapUpdater center={position} />
                    <Marker position={[position.lat, position.lng]} icon={icon} />
                    <MapEvents onChange={(coords) => {
                        setPosition(coords);
                        onChange(coords);
                    }} />
                </MapContainer>
            </div>
            <p className="text-xs text-zinc-400">
                Coords: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
        </div>
    );
}
