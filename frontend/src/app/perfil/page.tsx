"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import api from "@/lib/api";
import { User as UserIcon, Mail, Phone, Heart, Utensils, Edit3, Shield, Save, X, Camera, Lock, Loader2, Store } from "lucide-react";
import { cn, getFullImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
// ... imports

interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: "usuario" | "admin";
  biografia?: string;
  telefono?: string;
  fotoPerfil?: string;
  preferenciasComida?: string[];
  authProvider: "local" | "google";
  esPropietario?: boolean;
  createdAt: string;
}

interface Favorite {
  _id: string;
  lugar: {
    _id: string;
    nombre: string;
    tipo: string;
    fotos: string[];
    zona: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: "",
    biografia: "",
    telefono: "",
    fotoPerfil: "",
    preferenciasComida: [] as string[],
    currentPassword: "", // Required to save
    newPassword: "",     // Optional
    confirmNewPassword: ""
  });

  // Chip Input State
  const [chipInput, setChipInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, favRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/favoritos")
        ]);

        setUser(userRes.data);
        setFavorites(favRes.data);
        initializeForm(userRes.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // router.push("/auth/login"); // Redirect might be annoying if just one call fails, handle gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const initializeForm = (userData: User) => {
    setFormData({
      nombre: userData.nombre || "",
      biografia: userData.biografia || "",
      telefono: userData.telefono || "",
      fotoPerfil: userData.fotoPerfil || "",
      preferenciasComida: userData.preferenciasComida || [],
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      // Allow only numbers, plus, space, dash
      if (!/^[\d\s+\-]*$/.test(value)) return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error on change
    if (errors[name] || errors['global']) setErrors({ ...errors, [name]: "", global: "" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && chipInput.trim()) {
      e.preventDefault();
      if (!formData.preferenciasComida.includes(chipInput.trim())) {
        setFormData({
          ...formData,
          preferenciasComida: [...formData.preferenciasComida, chipInput.trim()]
        });
      }
      setChipInput("");
    }
  };

  const removeChip = (chipToRemove: string) => {
    setFormData({
      ...formData,
      preferenciasComida: formData.preferenciasComida.filter(chip => chip !== chipToRemove)
    });
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    setUploading(true);
    try {
      // We assume /api/upload exists and returns { imageUrl: "/uploads/filename.jpg" }
      const { data } = await api.post("/upload?folder=perfiles", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Store the relative path directly. The helper getFullImageUrl will handle the domain.
      // This avoids "undefined" issues and makes data portable.
      setFormData(prev => ({ ...prev, fotoPerfil: data.imageUrl }));
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
    }
  };

  const handlePreSave = () => {
    const newErrors: any = {};
    // Phone Validation
    const phoneDigits = formData.telefono.replace(/\D/g, '');
    if (formData.telefono && phoneDigits.length < 8) {
      newErrors.telefono = "Ingresa un número válido (mínimo 8 dígitos).";
    }

    // New Password Validation
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.newPassword = "Las nuevas contraseñas no coinciden.";
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Open modal to confirm
    setIsConfirmOpen(true);
  };

  const handleFinalSave = async () => {
    if (user?.authProvider === 'local' && !formData.currentPassword) {
      setErrors({ currentPassword: "Debes ingresar tu contraseña actual." });
      return;
    }

    try {
      const payload: any = {
        nombre: formData.nombre,
        biografia: formData.biografia,
        telefono: formData.telefono,
        fotoPerfil: formData.fotoPerfil,
        preferenciasComida: formData.preferenciasComida,
        currentPassword: formData.currentPassword
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      const response = await api.put("/users/me", payload);
      setUser(response.data);
      setIsEditing(false);
      setIsConfirmOpen(false);
      setErrors({});
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "", currentPassword: "" }));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setErrors({ global: error.response?.data?.message || "Error al actualizar perfil." });
    }
  };

  const handleCancel = () => {
    if (user) initializeForm(user);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="flex h-[50vh] w-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-black"></div></div>;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Sidebar / Profile Summary */}
        <div className="md:col-span-4 space-y-6">
          <Card className="text-center overflow-hidden border-zinc-200 shadow-sm relative">
            <div className="h-24 bg-zinc-900 w-full relative">
              {/* Cover/Pattern */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=300')] opacity-20 bg-cover bg-center" />
            </div>
            <CardContent className="pt-0 -mt-12 relative z-10">

              <div className="inline-flex items-center justify-center p-1 bg-white rounded-full mb-4 relative group">
                {formData.fotoPerfil ? (
                  <img
                    src={getFullImageUrl(formData.fotoPerfil)}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border border-zinc-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-300 border border-zinc-200">
                    <UserIcon className="h-10 w-10" />
                  </div>
                )}

                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-[#007068] text-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-[#005a54] transition-colors" title="Subir Foto">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadFile} />
                  </label>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 mb-4">
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="text-center font-bold text-lg h-9"
                    placeholder="Tu Nombre"
                    autoComplete="off"
                  />
                  <p className="text-xs text-zinc-500">Sube una foto o cambia tu nombre</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold">{user.nombre}</h2>
                  <p className="text-sm text-zinc-500 mb-6">{user.email}</p>
                </>
              )}

              <div className="flex justify-center gap-2 mb-6">
                <div className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                  <Shield className="h-3 w-3" /> {user.rol}
                </div>
                <div className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                  Miembro desde {new Date(user.createdAt).getFullYear()}
                </div>
              </div>

              {/* Error Toast Area */}
              {errors.global && (
                <div className="mb-4 bg-red-50 text-red-600 p-2 text-xs rounded border border-red-100">
                  {errors.global}
                </div>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-zinc-200 text-zinc-800 hover:bg-zinc-300" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                    <Button className="flex-1 bg-[#007068] text-white hover:bg-[#005a54]" onClick={handlePreSave}>
                      <Save className="mr-2 h-4 w-4" /> Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800" variant="default" onClick={() => setIsEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Info (Sidebar) */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-zinc-600">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <Phone className="h-4 w-4 shrink-0" />
                {isEditing ? (
                  <div className="w-full">
                    <Input
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={cn("h-8 text-sm", errors.telefono ? "border-red-500 focus-visible:ring-red-500" : "")}
                      placeholder="+591 ..."
                      autoComplete="tel"
                    />
                    {errors.telefono && <p className="text-[10px] text-red-500 mt-1">{errors.telefono}</p>}
                  </div>
                ) : (
                  <span>{user.telefono || "No registrado"}</span>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Management Actions (For Admins or Owners) */}
          {(user.rol === 'admin' || user.esPropietario) && (
            <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
                  <Store className="h-4 w-4" /> Gestión de Negocio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => router.push("/perfil/lugares")}
                >
                  Administrar mis Lugares
                </Button>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Main Content Area */}
        <div className="md:col-span-8 space-y-6">

          {/* About / Bio */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle>Sobre mí</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  name="biografia"
                  value={formData.biografia}
                  onChange={handleChange}
                  className="min-h-[150px] resize-none"
                  placeholder="Cuéntanos sobre ti, qué te gusta comer, tus lugares favoritos..."
                />
              ) : (
                user.biografia ? (
                  <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{user.biografia}</p>
                ) : (
                  <div className="text-center py-8 text-zinc-500 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                    <p>Cuéntanos un poco sobre ti y tus gustos gastronómicos.</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-zinc-900" onClick={() => setIsEditing(true)}>Agregar Biografía</Button>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Food Preferences */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" /> Preferencias Gastronómicas
              </CardTitle>
              <CardDescription>
                {isEditing ? "Escribe una preferencia y presiona Enter para agregarla." : "Tus gustos culinarios."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.preferenciasComida.map((pref, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-800 text-sm font-medium border border-zinc-200">
                        {pref}
                        <button
                          onClick={() => removeChip(pref)}
                          className="ml-1.5 text-zinc-400 hover:text-red-500 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    value={chipInput}
                    onChange={(e) => setChipInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Agregar preferencia (ej: Sushi, Parrilla)..."
                    className="max-w-md bg-white"
                    autoComplete="off"
                    name="food_preference_input" // Unique name to avoid auto-fill
                  />
                  <p className="text-xs text-zinc-400">Presiona Enter para agregar.</p>
                </div>
              ) : (
                user.preferenciasComida && user.preferenciasComida.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.preferenciasComida.map((pref, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium border border-zinc-200">
                        {pref}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No has seleccionado preferencias aún.</p>
                )
              )}
            </CardContent>
          </Card>

          {/* Change Password (Only in Edit Mode) */}
          {isEditing && user.authProvider === 'local' && (
            <Card className="border-red-100 shadow-sm bg-red-50/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-800">
                  <Lock className="h-5 w-5" /> Cambiar Contraseña
                </CardTitle>
                <CardDescription>
                  Solo llena estos campos si deseas cambiar tu contraseña.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={cn("bg-white", errors.newPassword && "border-red-500")}
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                    />
                    {errors.newPassword && <p className="text-[10px] text-red-600 mt-1">{errors.newPassword}</p>}
                  </div>
                  <div>
                    <Input
                      type="password"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      className="bg-white"
                      placeholder="Confirmar nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Favorites / Activity Placeholder */}
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" /> Mis Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((fav) => {
                    if (!fav.lugar) return null; // Skip if place was deleted
                    return (
                      <div key={fav._id} className="flex gap-4 p-3 rounded-lg border border-zinc-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/lugares/${fav.lugar._id}`)}>
                        <div className="h-20 w-20 bg-zinc-200 rounded-md shrink-0 overflow-hidden relative">
                          {fav.lugar.fotos && fav.lugar.fotos[0] && (
                            <img src={fav.lugar.fotos[0]} alt={fav.lugar.nombre} className="object-cover w-full h-full" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm truncate">{fav.lugar.nombre}</h4>
                          <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">{fav.lugar.tipo}</span>
                          <p className="text-xs text-zinc-500">{fav.lugar.zona}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 text-sm border border-dashed border-zinc-200">
                  Aquí aparecerán tus restaurantes guardados.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Cambios</DialogTitle>
            <DialogDescription>
              Por seguridad, ingresa tu contraseña actual para guardar los cambios en tu perfil.
            </DialogDescription>
          </DialogHeader>

          {(!user.authProvider || user.authProvider === 'local') && (
            <div className="py-4">
              <Input
                type="password"
                placeholder="Contraseña actual"
                value={formData.currentPassword}
                onChange={handleChange}
                name="currentPassword"
                className={cn(errors.currentPassword && "border-red-500 focus-visible:ring-red-500")}
                autoComplete="current-password"
              />
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
              {errors.global && <p className="text-red-500 text-xs mt-1">{errors.global}</p>}
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleFinalSave} className="bg-[#007068] hover:bg-[#005a54] text-white">
              Confirmar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
