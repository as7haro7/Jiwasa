"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

import {
    Loader2, Save, X, Upload, Plus, Trash, Copy,
    Store, MapPin, Clock, Camera, Tag, CreditCard, Wifi, Phone, Globe, DollarSign, Info
} from "lucide-react";
import api from "@/lib/api";
import { getFullImageUrl } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] bg-zinc-100 animate-pulse rounded-md flex items-center justify-center text-zinc-400">Cargando mapa...</div>
});

// If components/ui/Select doesn't exist, we fallback to native select
// Assuming Select is not standard, let's stick to native strictly if uncertain, OR check.
// list_dir showed 'ui' folder.

interface PlaceFormProps {
    initialData?: any;
    isEditing?: boolean;
}

const PLACE_TYPES = [
    { value: "restaurante", label: "Restaurante" },
    { value: "callejero", label: "Comida Callejera" },
    { value: "mercado", label: "Mercado" },
    { value: "café", label: "Cafetería" },
    { value: "bar", label: "Bar" },
    { value: "food_truck", label: "Food Truck" },
];

const PRICE_RANGES = [
    { value: "bajo", label: "Económico ($)" },
    { value: "medio", label: "Moderado ($$)" },
    { value: "alto", label: "Lujo ($$$)" }
];

const PAYMENT_METHODS = [
    { value: "efectivo", label: "Efectivo" },
    { value: "qr", label: "QR / Transferencia" },
    { value: "tarjeta", label: "Tarjeta de Débito/Crédito" }
];

const AMENITIES = [
    { value: "wifi", label: "Wi-Fi" },
    { value: "parqueo", label: "Estacionamiento" },
    { value: "reservas", label: "Acepta Reservas" },
    { value: "para_llevar", label: "Para Llevar" },
    { value: "musica_vivo", label: "Música en Vivo" },
    { value: "pet_friendly", label: "Pet Friendly 🐶" },
    { value: "bano", label: "Baño Disponible" },
];

const STATUS_OPTIONS = [
    { value: "activo", label: "🟢 Abierto (Activo)" },
    { value: "cerrado", label: "🔴 Cerrado Temporalmente" }
];

export default function PlaceForm({ initialData, isEditing = false }: PlaceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [newPlaceId, setNewPlaceId] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        tipo: "restaurante",
        direccion: "",
        zona: "",
        descripcion: "",
        tiposComida: [] as string[],
        telefonoContacto: "",
        emailContacto: "",
        redesSociales: [] as { platform: string, url: string }[],
        sitioWeb: "",
        rangoPrecios: "bajo",
        estado: "activo",
        metodosPago: [] as string[],
        servicios: [] as string[],
        horario: {} as any, // Simple object for now
        fotos: [] as string[],
        coordenadas: { type: "Point", coordinates: [-68.1193, -16.4897] } // Default La Paz aprox
    });

    const [chipInput, setChipInput] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                // Explicitly handle optional fields that might be null from backend
                descripcion: initialData.descripcion || "",
                telefonoContacto: initialData.telefonoContacto || "",
                emailContacto: initialData.emailContacto || "",
                sitioWeb: initialData.sitioWeb || "",
                rangoPrecios: initialData.rangoPrecios || "bajo",
                estado: initialData.estado || "activo",
                metodosPago: initialData.metodosPago || [],
                servicios: initialData.servicios || [],
                // Handle migration from object to array for Social Media
                redesSociales: Array.isArray(initialData.redesSociales)
                    ? initialData.redesSociales
                    : (initialData.redesSociales ? Object.entries(initialData.redesSociales).map(([k, v]) => ({ platform: k, url: v })) : []),
                horario: initialData.horario || {},
                // Ensure arrays validation
                tiposComida: initialData.tiposComida || [],
                fotos: initialData.fotos || [],
                coordenadas: initialData.coordenadas || prev.coordenadas
            }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChipKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && chipInput.trim()) {
            e.preventDefault();
            if (!formData.tiposComida.includes(chipInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tiposComida: [...prev.tiposComida, chipInput.trim()]
                }));
            }
            setChipInput("");
        }
    };

    const removeChip = (chip: string) => {
        setFormData(prev => ({
            ...prev,
            tiposComida: prev.tiposComida.filter(c => c !== chip)
        }));
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formPayload = new FormData();
        // Assuming API handles multiple or single. Let's loop for single if endpoint is single file.
        // The endpoint typically is single file. /api/upload

        try {
            const newPhotos = [...formData.fotos];
            for (let i = 0; i < files.length; i++) {
                const fData = new FormData();
                fData.append("image", files[i]);
                const { data } = await api.post("/upload?folder=places", fData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                newPhotos.push(data.imageUrl || data.url);
            }
            setFormData(prev => ({ ...prev, fotos: newPhotos }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            fotos: prev.fotos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await api.put(`/lugares/${initialData._id || initialData.id}`, formData);
                router.push("/perfil/lugares");
                router.refresh();
            } else {
                const { data } = await api.post("/lugares", formData);
                // On success, show dialog instead of redirecting immediately
                setNewPlaceId(data._id || data.id);
                setShowSuccessDialog(true);
            }
        } catch (error: any) {
            console.error("Error saving place", error);
            alert(error.response?.data?.message || "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Info (2 cols wide) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Basic Info Card */}
                        {/* 1. Basic Info Card */}
                        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                            <CardHeader className="pb-4 border-b border-zinc-100">
                                <CardTitle className="flex items-center gap-2 text-xl text-[#007068]">
                                    <Store className="h-5 w-5" /> Información Principal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Nombre del Lugar <span className="text-red-500">*</span></label>
                                        <Input
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Ej: Salteñería Los Castores"
                                            required
                                            className="h-12 text-lg"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Categoría</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007068]/20 focus:border-[#007068] transition-all appearance-none"
                                                    name="tipo"
                                                    value={formData.tipo}
                                                    onChange={handleChange}
                                                >
                                                    {PLACE_TYPES.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-3 pointer-events-none text-zinc-400">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Estado</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007068]/20 focus:border-[#007068] transition-all appearance-none"
                                                    name="estado"
                                                    value={formData.estado}
                                                    onChange={handleChange}
                                                >
                                                    {STATUS_OPTIONS.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-3 pointer-events-none text-zinc-400">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Descripción</label>
                                        <Textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            placeholder="Describe qué hace especial a tu lugar..."
                                            rows={4}
                                            className="resize-none"
                                        />
                                        <p className="text-xs text-zinc-400 mt-1 text-right">{formData.descripcion.length}/500</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Rango de Precios</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {PRICE_RANGES.map(range => {
                                                const isSelected = formData.rangoPrecios === range.value;
                                                return (
                                                    <div
                                                        key={range.value}
                                                        onClick={() => setFormData(p => ({ ...p, rangoPrecios: range.value }))}
                                                        className={`
                                                             cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center gap-1 transition-all
                                                             ${isSelected
                                                                ? 'bg-[#007068]/10 border-[#007068] text-[#007068]'
                                                                : 'bg-white border-zinc-200 text-zinc-600 hover:border-[#007068]/50 hover:bg-zinc-50'}
                                                         `}
                                                    >
                                                        <DollarSign className={`h-5 w-5 ${isSelected ? 'stroke-2' : 'stroke-1'}`} />
                                                        <span className="text-sm font-medium">{range.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Etiquetas de Comida</label>
                                        <div className="flex flex-wrap gap-2 mb-2 p-3 border border-zinc-200 rounded-lg min-h-[50px] bg-white focus-within:ring-2 focus-within:ring-[#007068]/20 focus-within:border-[#007068] transition-all">
                                            {formData.tiposComida.map((tag, i) => (
                                                <span key={i} className="bg-[#007068]/10 text-[#007068] text-sm px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                                                    {tag}
                                                    <button type="button" onClick={() => removeChip(tag)} className="hover:text-red-500 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                                </span>
                                            ))}
                                            <input
                                                className="bg-transparent outline-none flex-1 min-w-[120px] text-sm py-1"
                                                placeholder="Ej: Hamburguesas, Vegano..."
                                                value={chipInput}
                                                onChange={(e) => setChipInput(e.target.value)}
                                                onKeyDown={handleChipKeyDown}
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500">Presiona Enter para agregar una etiqueta.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Photos Card */}
                        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                            <CardHeader className="pb-4 border-b border-zinc-100">
                                <CardTitle className="flex items-center gap-2 text-xl text-[#007068]">
                                    <Camera className="h-5 w-5" /> Fotos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <label className="group flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#007068] hover:bg-[#007068]/5 cursor-pointer transition-all">
                                        <div className="bg-zinc-100 group-hover:bg-white p-3 rounded-full mb-2 transition-colors">
                                            {uploading ? <Loader2 className="h-6 w-6 animate-spin text-[#007068]" /> : <Plus className="h-6 w-6 text-zinc-500 group-hover:text-[#007068]" />}
                                        </div>
                                        <span className="text-xs font-medium text-zinc-500 group-hover:text-[#007068]">Subir Fotos</span>
                                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleUpload} disabled={uploading} />
                                    </label>

                                    {formData.fotos.map((foto, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm ring-1 ring-black/5">
                                            <img src={foto} alt={`Foto ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-white"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Location Card */}
                        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                            <CardHeader className="pb-4 border-b border-zinc-100">
                                <CardTitle className="flex items-center gap-2 text-xl text-[#007068]">
                                    <MapPin className="h-5 w-5" /> Ubicación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Zona / Barrio</label>
                                        <Input
                                            name="zona"
                                            value={formData.zona}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Dirección Exacta</label>
                                        <Input
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                                    <LocationPicker
                                        value={{
                                            lat: formData.coordenadas?.coordinates?.[1] || -16.5000,
                                            lng: formData.coordenadas?.coordinates?.[0] || -68.1193
                                        }}
                                        onChange={(coords) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                coordenadas: {
                                                    type: "Point",
                                                    coordinates: [coords.lng, coords.lat]
                                                }
                                            }));
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Details: Payment & Amenities */}
                        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                            <CardHeader className="pb-4 border-b border-zinc-100">
                                <CardTitle className="flex items-center gap-2 text-xl text-[#007068]">
                                    <Info className="h-5 w-5" /> Detalles Adicionales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                {/* Payment Methods - Tiles */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-700"><CreditCard className="h-4 w-4" /> Métodos de Pago</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {PAYMENT_METHODS.map(pm => {
                                            const isSelected = formData.metodosPago.includes(pm.value);
                                            return (
                                                <div
                                                    key={pm.value}
                                                    onClick={() => {
                                                        const newMethods = isSelected
                                                            ? formData.metodosPago.filter(p => p !== pm.value)
                                                            : [...formData.metodosPago, pm.value];
                                                        setFormData(prev => ({ ...prev, metodosPago: newMethods }));
                                                    }}
                                                    className={`
                                                        cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all select-none flex items-center gap-2
                                                        ${isSelected
                                                            ? 'bg-[#007068] border-[#007068] text-white shadow-md shadow-[#007068]/20'
                                                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-[#007068]/50 hover:bg-zinc-50'}
                                                    `}
                                                >
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                                    {pm.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Services - Tiles */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-700"><Wifi className="h-4 w-4" /> Servicios y Comodidades</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {AMENITIES.map(am => {
                                            const isSelected = formData.servicios.includes(am.value);
                                            return (
                                                <div
                                                    key={am.value}
                                                    onClick={() => {
                                                        const newAmenities = isSelected
                                                            ? formData.servicios.filter(p => p !== am.value)
                                                            : [...formData.servicios, am.value];
                                                        setFormData(prev => ({ ...prev, servicios: newAmenities }));
                                                    }}
                                                    className={`
                                                        cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all select-none flex items-center gap-2
                                                        ${isSelected
                                                            ? 'bg-[#007068] border-[#007068] text-white shadow-md shadow-[#007068]/20'
                                                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-[#007068]/50 hover:bg-zinc-50'}
                                                    `}
                                                >
                                                    {am.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Contact & Hours (1 col wide) */}
                    <div className="space-y-8 h-fit">
                        {/* 5. Contact Info Card */}
                        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
                            <CardHeader className="pb-4 border-b border-zinc-100">
                                <CardTitle className="flex items-center gap-2 text-xl text-[#007068]">
                                    <Phone className="h-5 w-5" /> Contacto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Teléfono / WhatsApp</label>
                                    <div className="flex rounded-lg border border-zinc-200 bg-white items-center overflow-hidden focus-within:ring-2 focus-within:ring-[#007068]/20 focus-within:border-[#007068] transition-all">
                                        <span className="bg-zinc-50 text-zinc-500 px-3 py-2.5 text-sm border-r border-zinc-200 font-medium">+591</span>
                                        <input
                                            className="flex h-11 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400"
                                            name="telefonoContacto"
                                            value={formData.telefonoContacto}
                                            onChange={handleChange}
                                            placeholder="70000000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Email (Público)</label>
                                    <Input
                                        name="emailContacto"
                                        value={formData.emailContacto}
                                        onChange={handleChange}
                                        placeholder="contacto@ejemplo.com"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-1.5 block text-zinc-700">Sitio Web</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            name="sitioWeb"
                                            value={formData.sitioWeb}
                                            onChange={handleChange}
                                            placeholder="https://tunsitioweb.com"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100">
                                    <label className="text-sm font-semibold mb-3 block text-zinc-700">Redes Sociales</label>
                                    <div className="space-y-3">
                                        {Array.isArray(formData.redesSociales) && formData.redesSociales.map((red, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        placeholder="Plataforma (ej: Facebook)"
                                                        value={red.platform}
                                                        onChange={(e) => {
                                                            const newRedes = [...(formData.redesSociales as any[])];
                                                            newRedes[index].platform = e.target.value;
                                                            setFormData(p => ({ ...p, redesSociales: newRedes }));
                                                        }}
                                                        className="h-9 text-xs"
                                                    />
                                                    <Input
                                                        placeholder="URL / Usuario"
                                                        value={red.url}
                                                        onChange={(e) => {
                                                            const newRedes = [...(formData.redesSociales as any[])];
                                                            newRedes[index].url = e.target.value;
                                                            setFormData(p => ({ ...p, redesSociales: newRedes }));
                                                        }}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newRedes = (formData.redesSociales as any[]).filter((_, i) => i !== index);
                                                        setFormData(p => ({ ...p, redesSociales: newRedes }));
                                                    }}
                                                    className="mt-1 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData(p => ({
                                                ...p,
                                                redesSociales: [...(Array.isArray(p.redesSociales) ? p.redesSociales : []), { platform: "", url: "" }]
                                            }))}
                                            className="w-full border-dashed"
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Agregar Red Social
                                        </Button>
                                    </div>
                                </div>

                                {isEditing && initialData?._id && (
                                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Enlace Público (Jiwasa)</label>
                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/lugares/${initialData._id}`}
                                                className="bg-white text-zinc-600 h-9 text-xs"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 shrink-0"
                                                onClick={() => {
                                                    const url = `${window.location.origin}/lugares/${initialData._id}`;
                                                    navigator.clipboard.writeText(url);
                                                    // toast success could go here
                                                    alert("Enlace copiado al portapapeles");
                                                }}
                                                title="Copiar enlace"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 6. Schedule Card */}
                        <Card className="border-0 shadow-sm ring-1 ring-zinc-200 sticky top-24">
                            <CardHeader className="pb-4 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="flex items-center gap-2 text-xl text-[#007068]">
                                    <Clock className="h-5 w-5" /> Horario
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-[#007068] h-8 px-2 hover:bg-[#007068]/10"
                                    onClick={() => {
                                        const monday = (formData.horario as any)?.['lunes'];
                                        if (!monday) return alert("Configura primero el horario del lunes.");
                                        const newHorario = { ...formData.horario } as any;
                                        ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].forEach(day => {
                                            newHorario[day] = { ...monday };
                                        });
                                        setFormData(p => ({ ...p, horario: newHorario }));
                                    }}
                                >
                                    <Copy className="h-3 w-3 mr-1" /> Copiar Lunes
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-4 p-0">
                                <div className="divide-y divide-zinc-100">
                                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(day => (
                                        <div key={day} className="flex items-center justify-between p-3 hover:bg-zinc-50 transition-colors">
                                            <div className="w-20 capitalize font-medium text-sm text-zinc-700">{day}</div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    className="border border-zinc-200 rounded px-1.5 py-1 text-xs text-zinc-600 bg-white focus:border-[#007068] outline-none"
                                                    value={(formData.horario as any)?.[day]?.apertura || ""}
                                                    onChange={(e) => setFormData(p => ({
                                                        ...p,
                                                        horario: {
                                                            ...p.horario,
                                                            [day]: { ...(p.horario as any)?.[day], apertura: e.target.value }
                                                        }
                                                    }))}
                                                />
                                                <span className="text-zinc-400 text-xs">a</span>
                                                <input
                                                    type="time"
                                                    className="border border-zinc-200 rounded px-1.5 py-1 text-xs text-zinc-600 bg-white focus:border-[#007068] outline-none"
                                                    value={(formData.horario as any)?.[day]?.cierre || ""}
                                                    onChange={(e) => setFormData(p => ({
                                                        ...p,
                                                        horario: {
                                                            ...p.horario,
                                                            [day]: { ...(p.horario as any)?.[day], cierre: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <label
                                                htmlFor={`closed-${day}`}
                                                className={`
                                                    ml-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer border select-none transition-colors
                                                    ${(formData.horario as any)?.[day]?.cerrado
                                                        ? 'bg-red-50 text-red-600 border-red-100 ring-1 ring-red-200'
                                                        : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'}
                                                `}
                                            >
                                                <input
                                                    id={`closed-${day}`}
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={(formData.horario as any)?.[day]?.cerrado || false}
                                                    onChange={(e) => setFormData(p => ({
                                                        ...p,
                                                        horario: {
                                                            ...p.horario,
                                                            [day]: { ...(p.horario as any)?.[day], cerrado: e.target.checked }
                                                        }
                                                    }))}
                                                />
                                                {(formData.horario as any)?.[day]?.cerrado ? 'Cerrado' : 'Abierto'}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-200 flex justify-end gap-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="max-w-5xl mx-auto w-full flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.back()} className="hover:bg-zinc-100">
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-[#007068] hover:bg-[#005a54] text-white min-w-[150px] shadow-lg shadow-[#007068]/20" disabled={loading || uploading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isEditing ? "Guardar Cambios" : "Completar Registro"}
                        </Button>
                    </div>
                </div>
            </form>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¡Lugar registrado con éxito!</DialogTitle>
                        <DialogDescription>
                            El lugar ha sido creado correctamente. ¿Te gustaría configurar el menú y agregar platos ahora?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 justify-end sm:justify-end">
                        <Button variant="outline" onClick={() => router.push("/perfil/lugares")}>
                            No, ir a Mis Lugares
                        </Button>
                        <Button className="bg-[#007068] text-white" onClick={() => router.push(`/perfil/lugares/editar/${newPlaceId}?tab=menu`)}>
                            Sí, agregar Platos
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
