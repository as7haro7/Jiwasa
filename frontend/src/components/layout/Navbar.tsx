"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Search, MapPin, Menu, User, LogOut, ChevronDown, Compass, Mountain } from "lucide-react";
import { cn, getFullImageUrl } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  nombre: string;
  fotoPerfil?: string;
  rol?: string;
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar search after scrolling past hero (approx 500px)
      setShowSearch(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isAuthenticated = !!user;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-100 transition-all duration-300 h-20 flex items-center">
      <div className="container mx-auto flex h-full items-center justify-between px-6 gap-6">

        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="bg-gradient-to-br from-[#007068] to-[#004a45] text-white p-2.5 rounded-xl shadow-lg shadow-[#007068]/20 group-hover:shadow-[#007068]/40 group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <Compass className="h-5 w-5 relative z-10" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden md:flex flex-col -space-y-0.5">
            <span className="text-xl font-black tracking-tighter text-zinc-900 group-hover:text-[#007068] transition-colors leading-none">
              JIWASA<span className="text-[#007068]">.</span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-400 uppercase leading-none">Explora</span>
          </div>
        </Link>

        {/* Sticky Search Bar - Visible on Scroll (Only on Home) */}
        {pathname === "/" && (
          <div className={cn(
            "flex-1 max-w-2xl mx-6 transition-all duration-500 ease-out hidden md:block",
            showSearch ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          )}>
            <div className="flex items-center bg-zinc-50/50 border border-zinc-200 rounded-full shadow-sm hover:shadow-md hover:border-zinc-300 transition-all h-12 px-2">
              {/* Location */}
              <div className="flex-1 flex items-center px-4 h-full border-r border-zinc-200">
                <MapPin className="h-4 w-4 text-[#007068] shrink-0 mr-3" />
                <input
                  className="w-full text-sm font-bold bg-transparent outline-none text-zinc-800 placeholder:text-zinc-400 truncate"
                  placeholder="Ubicación"
                  defaultValue="Cerca de mí"
                />
              </div>
              {/* Keyword */}
              <div className="flex-[1.5] flex items-center px-4 h-full relative">
                <Search className="h-4 w-4 text-zinc-400 shrink-0 mr-3" />
                <input
                  className="w-full text-sm font-bold bg-transparent outline-none text-zinc-800 placeholder:text-zinc-400 truncate"
                  placeholder="Buscar restaurantes..."
                />
              </div>
              {/* Button */}
              <button className="bg-[#007068] hover:bg-[#005a54] hover:scale-105 active:scale-95 text-white p-2 rounded-full transition-all shadow-md shadow-[#007068]/20">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 shrink-0">
          {/* Mobile Search Icon (visible when bar is hidden) */}
          <Button variant="ghost" size="icon" className="md:hidden text-zinc-600 rounded-full hover:bg-zinc-100">
            <Search className="h-5 w-5" />
          </Button>

          {loading ? (
            // Skeleton loader
            <div className="flex items-center gap-3 animate-pulse">
              <div className="hidden md:flex flex-col items-end mr-1">
                <div className="h-4 w-20 bg-zinc-200 rounded mb-1"></div>
                <div className="h-3 w-16 bg-zinc-100 rounded"></div>
              </div>
              <div className="h-10 w-10 bg-zinc-200 rounded-full"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none group cursor-pointer p-1 rounded-full hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
              >
                <div className="hidden md:flex flex-col items-end mr-1 text-right">
                  <span className="text-sm font-bold text-zinc-900 leading-none group-hover:text-[#007068] transition-colors">{user?.nombre?.split(' ')[0] || 'Usuario'}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{user?.rol || 'Miembro'}</span>
                </div>
                {user?.fotoPerfil ? (
                  <img src={getFullImageUrl(user.fotoPerfil)} alt="Avatar" className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-400 ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-zinc-400 hidden md:block group-hover:text-zinc-600 transition-colors" />
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-200/50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-5 py-4 border-b border-zinc-100 mb-2 bg-zinc-50/50">
                      <p className="text-sm font-extrabold text-zinc-900 truncate">{user?.nombre || "Usuario"}</p>
                      <p className="text-xs font-medium text-zinc-500 capitalize">{user?.email}</p>
                    </div>
                    <div className="px-2 space-y-1">
                      <Link
                        href="/perfil"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" /> Mi Perfil
                      </Link>
                      <Link
                        href="/favoritos"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="scale-75 text-red-500">❤️</div> Mis Favoritos
                      </Link>
                    </div>
                    <div className="border-t border-zinc-100 my-2 pt-2 px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all text-left"
                      >
                        <LogOut className="h-4 w-4" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-zinc-600 font-bold hover:bg-zinc-100 hover:text-zinc-900 text-sm rounded-full px-5 transition-colors">Ingresar</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#007068] text-white hover:bg-[#005a54] rounded-full px-6 text-sm font-bold shadow-lg shadow-[#007068]/20 hover:scale-105 active:scale-95 transition-all">Crear cuenta</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden ml-1 rounded-full text-zinc-700 hover:bg-zinc-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-white/95 backdrop-blur-xl border-b border-zinc-200 p-6 shadow-2xl md:hidden flex flex-col gap-4 z-40 animate-in slide-in-from-top-4 duration-300">
          <Link href="/" className="font-bold text-lg text-zinc-800 p-3 hover:bg-zinc-50 rounded-xl transition-colors">Inicio</Link>
          <Link href="/explorar" className="font-bold text-lg text-zinc-800 p-3 hover:bg-zinc-50 rounded-xl transition-colors">Explorar</Link>
          {isAuthenticated && <Link href="/perfil" className="font-bold text-lg text-zinc-800 p-3 hover:bg-zinc-50 rounded-xl transition-colors border-t border-zinc-100 mt-2">Mi Perfil</Link>}
        </div>
      )}
    </nav>
  );
}
