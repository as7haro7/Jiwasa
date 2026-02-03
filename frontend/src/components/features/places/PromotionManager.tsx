"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import api from "@/lib/api";
import { Plus, Trash2, Edit2, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Promotion {
    _id: string;
    titulo: string;
    descripcion: string;
    platoId?: string;
    descuentoPorcentaje?: number;
    precioPromo?: number;
    fechaInicio: string;
    fechaFin: string;
    activa: boolean;
}

interface PromotionManagerProps {
    placeId: string;
}

export default function PromotionManager({ placeId }: PromotionManagerProps) {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [dishes, setDishes] = useState<any[]>([]); // Dishes list for selection
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        descuentoPorcentaje: "",
        precioPromo: "",
        fechaInicio: "",
        fechaFin: "",
        activa: true,
        platoId: ""
    });

    useEffect(() => {
        fetchData();
    }, [placeId]);

    const fetchData = async () => {
        try {
            const [promosRes, dishesRes] = await Promise.all([
                api.get(`/lugares/${placeId}/promociones`),
                api.get(`/lugares/${placeId}/platos`)
            ]);
            setPromotions(promosRes.data);

            // Handle both legacy (array) and new (paginated) responses
            const dishesData = dishesRes.data;
            if (Array.isArray(dishesData)) {
                setDishes(dishesData);
            } else {
                setDishes(dishesData.dishes || []);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (promo?: Promotion) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                titulo: promo.titulo,
                descripcion: promo.descripcion,
                descuentoPorcentaje: promo.descuentoPorcentaje?.toString() || "",
                precioPromo: promo.precioPromo?.toString() || "",
                // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
                fechaInicio: promo.fechaInicio ? new Date(promo.fechaInicio).toISOString().slice(0, 16) : "",
                fechaFin: promo.fechaFin ? new Date(promo.fechaFin).toISOString().slice(0, 16) : "",
                activa: promo.activa,
                platoId: promo.platoId || ""
            });
        } else {
            setEditingPromo(null);
            setFormData({
                titulo: "",
                descripcion: "",
                descuentoPorcentaje: "",
                precioPromo: "",
                fechaInicio: "",
                fechaFin: "",
                activa: true,
                platoId: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
            alert("La fecha de fin debe ser posterior a la fecha de inicio.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                descuentoPorcentaje: formData.descuentoPorcentaje ? parseFloat(formData.descuentoPorcentaje) : null,
                precioPromo: formData.precioPromo ? parseFloat(formData.precioPromo) : null
            };

            if (editingPromo) {
                const { data } = await api.put(`/promociones/${editingPromo._id}`, payload);
                setPromotions(prev => prev.map(p => p._id === editingPromo._id ? data : p));
            } else {
                const { data } = await api.post(`/lugares/${placeId}/promociones`, payload);
                setPromotions(prev => [...prev, data]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving promotion", error);
            alert("Error al guardar la promoción");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta promoción?")) return;
        try {
            await api.delete(`/promociones/${id}`);
            setPromotions(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            console.error("Error deleting promotion", error);
            alert("Error al eliminar");
        }
    };

    if (loading) return <div className="text-center py-4 text-zinc-400">Cargando promociones...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="h-5 w-5" /> Promociones
                </h3>
                <Button size="sm" onClick={() => handleOpenDialog()} className="bg-[#007068] text-white hover:bg-[#005a54]">
                    <Plus className="h-4 w-4 mr-1" /> Nueva Promoción
                </Button>
            </div>

            {promotions.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg bg-zinc-50 text-zinc-400 text-sm">
                    No hay promociones activas.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {promotions.map(promo => (
                        <div key={promo._id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                            <div>
                                <h4 className="font-medium text-[#007068]">{promo.titulo}</h4>
                                <p className="text-sm text-zinc-500 line-clamp-1">{promo.descripcion}</p>
                                <div className="text-xs text-zinc-400 mt-1 flex gap-2">
                                    <span>Inicia: {format(new Date(promo.fechaInicio), "dd MMM yyyy", { locale: es })}</span>
                                    <span>•</span>
                                    <span>Termina: {format(new Date(promo.fechaFin), "dd MMM yyyy", { locale: es })}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(promo)}>
                                    <Edit2 className="h-4 w-4 text-zinc-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(promo._id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPromo ? "Editar Promoción" : "Nueva Promoción"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <label className="text-xs mb-1 block">Plato en Promoción (Opcional)</label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.platoId}
                                onChange={(e) => {
                                    const pid = e.target.value;
                                    const dish = dishes.find(d => d._id === pid);
                                    if (dish && !formData.titulo) {
                                        // Auto-fill title if empty
                                        setFormData(prev => ({ ...prev, platoId: pid, titulo: `Oferta en ${dish.nombre}` }));
                                    } else {
                                        setFormData(prev => ({ ...prev, platoId: pid }));
                                    }
                                }}
                            >
                                <option value="">-- Toda la carta / General --</option>
                                {dishes.map(d => (
                                    <option key={d._id} value={d._id}>{d.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Input
                                placeholder="Título"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Textarea
                                placeholder="Detalles de la promo"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs mb-1 block">Precio Promo (Bs)</label>
                                <Input
                                    type="number"
                                    placeholder=""
                                    value={formData.precioPromo}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => {
                                            const newState = { ...prev, precioPromo: val };
                                            // Optional: Reverse calc discount if dish selected
                                            if (prev.platoId && val) {
                                                const dish = dishes.find(d => d._id === prev.platoId);
                                                if (dish && dish.precio > 0) {
                                                    const price = parseFloat(val);
                                                    const discount = ((dish.precio - price) / dish.precio) * 100;
                                                    newState.descuentoPorcentaje = discount > 0 ? discount.toFixed(0) : "";
                                                }
                                            }
                                            return newState;
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block">% Descuento</label>
                                <Input
                                    type="number"
                                    placeholder="Ej: 20"
                                    value={formData.descuentoPorcentaje}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => {
                                            const newState = { ...prev, descuentoPorcentaje: val };
                                            // Calc price if dish selected
                                            if (prev.platoId && val) {
                                                const dish = dishes.find(d => d._id === prev.platoId);
                                                if (dish) {
                                                    const disc = parseFloat(val);
                                                    const finalPrice = dish.precio * (1 - disc / 100);
                                                    newState.precioPromo = finalPrice.toFixed(1);
                                                }
                                            }
                                            return newState;
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        {formData.platoId && dishes.find(d => d._id === formData.platoId) && (
                            <div className="text-xs text-zinc-500 bg-zinc-50 p-2 rounded">
                                Precio original: <span className="font-bold">Bs {dishes.find(d => d._id === formData.platoId)?.precio}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs mb-1 block">Fecha Inicio</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.fechaInicio}
                                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                    required
                                    className="block w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block">Fecha Fin</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.fechaFin}
                                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                    required
                                    className="block w-full"
                                />
                            </div>
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
