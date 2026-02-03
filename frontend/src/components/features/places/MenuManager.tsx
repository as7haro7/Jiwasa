"use client";

import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import api from "@/lib/api";
import { Plus, Trash2, Edit2, Utensils, X, Loader2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface Dish {
    _id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    disponible: boolean;
    foto?: string;
}

interface MenuManagerProps {
    placeId: string;
}

export default function MenuManager({ placeId }: MenuManagerProps) {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDish, setEditingDish] = useState<Dish | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "",
        disponible: true,
        foto: ""
    });
    // Search & Pagination State
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Todos");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDishes, setTotalDishes] = useState(0);

    const [uploading, setUploading] = useState(false);

    // Reset page when search or category changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, categoryFilter]);


    // Reset page when category changes
    useEffect(() => {
        setPage(1);
    }, [categoryFilter]);

    useEffect(() => {
        fetchDishes();
    }, [placeId, debouncedSearch, categoryFilter, page]);

    const fetchDishes = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("page", page.toString());
            queryParams.append("limit", "5"); // Keep it small for smooth UI in modal/list
            if (debouncedSearch) queryParams.append("search", debouncedSearch);
            if (categoryFilter !== "Todos") queryParams.append("category", categoryFilter);

            const { data } = await api.get(`/lugares/${placeId}/platos?${queryParams.toString()}`);

            // Handle both legacy (array) and new (paginated) responses just in case
            if (Array.isArray(data)) {
                setDishes(data);
                setTotalPages(1);
            } else {
                setDishes(data.dishes);
                setTotalPages(data.pages);
                setTotalDishes(data.total);
            }
        } catch (error) {
            console.error("Error fetching dishes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (dish?: Dish) => {
        if (dish) {
            setEditingDish(dish);
            setFormData({
                nombre: dish.nombre,
                descripcion: dish.descripcion || "",
                precio: dish.precio.toString(),
                categoria: dish.categoria || "",
                disponible: dish.disponible,
                foto: dish.foto || ""
            });
        } else {
            setEditingDish(null);
            setFormData({
                nombre: "",
                descripcion: "",
                precio: "",
                categoria: "",
                disponible: true,
                foto: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleUploadDish = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fData = new FormData();
        fData.append("image", file);

        try {
            const { data } = await api.post("/upload?folder=dishes", fData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, foto: data.imageUrl || data.url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                precio: parseFloat(formData.precio)
            };

            if (editingDish) {
                const { data } = await api.put(`/lugares/${placeId}/platos/${editingDish._id}`, payload);
                setDishes(prev => prev.map(d => d._id === editingDish._id ? data : d));
            } else {
                const { data } = await api.post(`/lugares/${placeId}/platos`, payload);
                setDishes(prev => [...prev, data]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving dish", error);
            alert("Error al guardar el plato");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este plato?")) return;
        try {
            await api.delete(`/lugares/${placeId}/platos/${id}`);
            setDishes(prev => prev.filter(d => d._id !== id));
        } catch (error) {
            console.error("Error deleting dish", error);
        }
    };



    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Utensils className="h-5 w-5" /> Menú
                </h3>
                <Button size="sm" onClick={() => handleOpenDialog()} className="bg-[#007068] text-white hover:bg-[#005a54]">
                    <Plus className="h-4 w-4 mr-1" /> Agregar Plato
                </Button>
            </div>


            {/* Search and Filters */}
            <div className="space-y-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                <DishSearchBar onSearch={setDebouncedSearch} loading={loading} />
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {["Todos", "Entradas", "Platos Fuertes", "Bebidas", "Postres", "Otros"].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`
                                whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full border transition-colors
                                ${categoryFilter === cat
                                    ? "bg-[#007068] text-white border-[#007068]"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <Loader2 className="h-6 w-6 animate-spin text-[#007068]" />
                    </div>
                )}

                {dishes.length === 0 && !loading ? (
                    <div className="text-center py-8 border border-dashed rounded-lg bg-zinc-50 text-zinc-400 text-sm">
                        {debouncedSearch || categoryFilter !== "Todos"
                            ? "No se encontraron platos con estos filtros."
                            : "No has agregado platos a tu menú."}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                            {dishes.map(dish => (
                                <div key={dish._id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                                    <div className="flex gap-4 items-center">
                                        {dish.foto ? (
                                            <img src={dish.foto} alt={dish.nombre} className="h-16 w-16 object-cover rounded-md border border-zinc-100 shrink-0" />
                                        ) : (
                                            <div className="h-16 w-16 bg-zinc-100 rounded-md border border-zinc-100 flex items-center justify-center text-zinc-300 shrink-0">
                                                <Utensils className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-medium">{dish.nombre}</h4>
                                            <p className="text-sm text-zinc-500 line-clamp-1">{dish.descripcion}</p>
                                            <span className="text-sm font-bold text-[#007068]">{dish.precio} Bs.</span>
                                            {dish.categoria && <span className="ml-2 text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">{dish.categoria}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(dish)}>
                                            <Edit2 className="h-4 w-4 text-zinc-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dish._id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs text-zinc-500">
                                    Pág {page} de {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDish ? "Editar Plato" : "Nuevo Plato"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <Input
                                placeholder="Nombre del plato"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Textarea
                                placeholder=""
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Foto del Plato</label>
                            <div className="flex items-center gap-4">
                                {formData.foto && (
                                    <img src={formData.foto} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                                )}
                                <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-black text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-2">
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    {formData.foto ? "Cambiar foto" : "Subir foto"}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadDish} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                placeholder="Precio"
                                value={formData.precio}
                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                required
                                step="0.5"
                            />
                            <Input
                                placeholder="Categoría"
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[#007068] text-white" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const DishSearchBar = memo(({ onSearch, loading }: { onSearch: (term: string) => void, loading: boolean }) => {
    const [term, setTerm] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!touched) return; // Prevent initial search
        const timer = setTimeout(() => {
            onSearch(term);
        }, 500);
        return () => clearTimeout(timer);
    }, [term, onSearch, touched]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
                placeholder="Buscar plato..."
                value={term}
                onChange={(e) => {
                    setTerm(e.target.value);
                    setTouched(true);
                }}
                className="pl-9 bg-white"
            />
            {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-[#007068]" />}
        </div>
    );
});
DishSearchBar.displayName = "DishSearchBar";
