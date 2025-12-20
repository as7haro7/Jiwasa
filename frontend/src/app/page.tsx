"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import api from "@/lib/api";
import { Search, Star, Clock, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfferCard } from "@/components/features/home/OfferCard";
import { PlaceListCard } from "@/components/features/home/PlaceListCard";
import { BookedCard } from "@/components/features/home/BookedCard";
import { NewPlaceCard } from "@/components/features/home/NewPlaceCard";

interface Place {
  _id: string;
  nombre: string;
  tipo: string;
  zona: string;
  fotos: string[];
  promedioRating: number;
}

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { name: "Restaurantes", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", color: "bg-orange-100" },
    { name: "Callejero", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80", color: "bg-yellow-100" },
    { name: "Mercados", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=500&q=80", color: "bg-green-100" },
    { name: "Cafés", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80", color: "bg-stone-100" },
    { name: "Tradicional", image: "https://images.unsplash.com/photo-1574484284008-86d47dc6b674?w=500&q=80", color: "bg-red-100" },
  ];

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await api.get("/lugares");
        setPlaces(response.data.lugares || []);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const featuredPlaces = places.slice(0, 4); // Just show top 4 for "Featured"

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero / Search Section */}
      <div className="relative w-full bg-black text-white py-24 px-4 flex flex-col items-center justify-center text-center space-y-8">
          {/* Background Pattern or subtle image overlay could go here */}
          <div className="absolute inset-0 bg-[url('/baner.jpg')] opacity-20 bg-cover bg-center" />
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Los mejores sabores de La Paz
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto">
                Encuentra y disfruta desde comida callejera hasta la mejor gastronomía local.
            </p>
          </div>
          
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-sm p-1.5 flex flex-col md:flex-row items-center shadow-xl divide-y md:divide-y-0 md:divide-x divide-zinc-200">
              
              {/* Location Input */}
              <div className="flex-1 flex items-center w-full md:w-auto px-4 h-12">
                  <MapPin className="h-5 w-5 text-zinc-500 shrink-0" />
                  <Input 
                    className="border-none shadow-none focus-visible:ring-0 text-black text-base placeholder:text-zinc-500 w-full"
                    placeholder="Cerca de mí"
                    defaultValue="Cerca de mí" // Placeholder value for now
                  />
              </div>

              {/* Keyword Input */}
              <div className="flex-[1.5] flex items-center w-full md:w-auto px-4 h-12">
                  <Search className="h-5 w-5 text-zinc-500 shrink-0" />
                  <Input 
                    className="border-none shadow-none focus-visible:ring-0 text-black text-base placeholder:text-zinc-500 w-full"
                    placeholder="Buscar salteñas, zona sur..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
              </div>

              <Button className="w-full md:w-auto h-12 px-8 rounded-sm bg-[#007068] hover:bg-[#005a54] text-white font-bold text-base transition-colors uppercase tracking-wide">
                  Búsqueda
              </Button>
          </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Categories Section */}
        <section>
            <h2 className="text-2xl font-bold mb-6">Explora por categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((cat) => (
                    <Link href="#" key={cat.name} className="group">
                        <div className={cn("rounded-sm aspect-4/3 relative overflow-hidden mb-2 shadow-sm transition-transform group-hover:-translate-y-1", cat.color)}>
                           <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                           <span className="absolute bottom-3 left-3 font-bold text-white text-lg drop-shadow-md">{cat.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* Nuestras mejores ofertas - (Mocked via slice) */}
        <section>
             <h2 className="text-2xl font-bold mb-2">Nuestras mejores ofertas</h2>
             <p className="text-zinc-500 mb-6">Descuentos exclusivos de hasta el 50%</p>
             
             {loading ? <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {places.slice(0, 4).map((place) => (
                    <OfferCard key={place._id} place={place} />
                ))}
             </div>}
        </section>

         {/* Lo mejor para ti */}
        <section className="bg-zinc-50 -mx-4 px-4 py-12 md:rounded-2xl md:mx-0 md:px-8">
             <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-bold">Lo mejor para ti</h2>
                    <p className="text-zinc-500">Selección basada en tus gustos</p>
                 </div>
             </div>
              {loading ? <div className="h-64 bg-zinc-200 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {places.slice(0, 3).map((place) => (
                    <PlaceListCard key={place._id + 'foryou'} place={place} />
                ))}
             </div>}
        </section>

        {/* Los más reservados del mes */}
        <section>
             <h2 className="text-2xl font-bold mb-6">Los más reservados del mes</h2>
              {loading ? <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {places.slice(0, 4).map((place) => (
                    <BookedCard key={place._id + 'booked'} place={place} />
                ))}
             </div>}
        </section>
        
        {/* Top 100 La Paz (Madrid adapted) */}
         <section className="bg-black text-white rounded-2xl p-8 md:p-12 relative overflow-hidden">
             {/* Abstract BG */}
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black to-transparent z-10" />
             <div className="absolute inset-0 bg-[url('/baner.jpg')] bg-cover bg-center opacity-40" />
             
             <div className="relative z-20 max-w-lg space-y-6">
                 <div className="inline-block bg-[#5ba829] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                     Guía 2025
                 </div>
                 <h2 className="text-4xl font-bold">Top 100 La Paz</h2>
                 <p className="text-zinc-300 text-lg">
                     Descubre los restaurantes que definen la gastronomía paceña este año. Una lista exclusiva curada por expertos y calificada por comensales.
                 </p>
                 <Button className="bg-white text-black hover:bg-zinc-200 h-12 px-8 rounded-sm text-base font-medium">
                     Ver la lista completa
                 </Button>
             </div>
         </section>

         {/* Nuevo y digno de atención */}
        <section>
             <h2 className="text-2xl font-bold mb-6">Nuevo y digno de atención</h2>
              {loading ? <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" /> : 
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {places.slice(0, 3).map((place) => (
                    <NewPlaceCard key={place._id + 'new'} place={place} />
                ))}
            </div>}
        </section>

        {/* Banner Section (Owner) */}
        <section className="bg-zinc-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-zinc-200">
            <div className="space-y-4 max-w-lg text-center md:text-left">
                <h2 className="text-3xl font-bold">¿Eres propietario de un restaurante?</h2>
                <p className="text-zinc-600 text-lg">
                    Únete a JIWASA y haz que miles de personas descubran tu sabor. Gestiona reservas, recibe opiniones y crece tu negocio.
                </p>
                <Button className="bg-black text-white hover:bg-zinc-800 h-12 px-8 rounded-full text-base">
                    Registra tu negocio
                </Button>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-zinc-200 rounded-xl" />
        </section>

      </div>
    </div>
  );
}
