"use client";

import PlaceForm from "@/components/features/places/PlaceForm";
import { Store } from "lucide-react";

export default function NewPlacePage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <Store className="h-8 w-8 text-[#007068]" /> Registrar Nuevo Lugar
                </h1>
                <p className="text-zinc-500">
                    Sigue los pasos para publicar tu establecimiento en Jiwasa.
                </p>
            </div>

            <PlaceForm />
        </div>
    );
}
