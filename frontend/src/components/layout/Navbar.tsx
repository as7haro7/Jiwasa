"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Search, MapPin, Menu, User, LogOut } from "lucide-react";
import { cn, getFullImageUrl } from "@/lib/utils";
import api from "@/lib/api";

interface UserProfile {
  nombre: string;
  fotoPerfil?: string;
  rol?: string;
}

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm transition-all duration-300 h-20 flex items-center">
      <div className="container mx-auto flex h-full items-center justify-between px-4 gap-4">

        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="bg-[#007068] text-white p-1.5 rounded-sm group-hover:bg-[#005a54] transition-colors">
            <User className="h-6 w-6" /> {/* Placeholder Logo Icon */}
          </div>
          <span className="text-xl font-bold tracking-tighter text-[#007068] hidden md:block">JIWASA.</span>
        </Link>

        {/* Sticky Search Bar - Visible on Scroll */}
        <div className={cn(
          "flex-1 max-w-3xl mx-4 transition-all duration-300 transform hidden md:block",
          showSearch ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}>
          <div className="flex items-center bg-white border border-zinc-200 rounded-sm shadow-sm hover:shadow-md transition-shadow h-12 divide-x divide-zinc-200">
            {/* Location */}
            <div className="flex-1 flex items-center px-4 h-full">
              <MapPin className="h-4 w-4 text-zinc-500 shrink-0 mr-2" />
              <input
                className="w-full text-base outline-none text-zinc-900 placeholder:text-zinc-500 font-medium truncate"
                placeholder="Cerca de mí"
                defaultValue="Cerca de mí"
              />
            </div>
            {/* Keyword */}
            <div className="flex-[1.5] flex items-center px-4 h-full relative">
              <Search className="h-4 w-4 text-zinc-500 shrink-0 mr-2" />
              <input
                className="w-full text-base outline-none text-zinc-900 placeholder:text-zinc-500 truncate"
                placeholder="Tipo de cocina, nombre..."
              />
            </div>
            {/* Button */}
            <button className="bg-[#007068] hover:bg-[#005a54] text-white text-sm font-bold px-6 h-full transition-colors uppercase tracking-wider rounded-r-sm cursor-pointer">
              Búsqueda
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Mobile Search Icon (visible when bar is hidden) */}
          <Button variant="ghost" size="icon" className="md:hidden text-zinc-600 rounded-sm">
            <Search className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none group cursor-pointer"
              >
                <div className="hidden md:flex flex-col items-end mr-2 text-right">
                  <span className="text-sm font-bold text-zinc-900 leading-none">{user?.nombre?.split(' ')[0] || 'Usuario'}</span>
                </div>
                {user?.fotoPerfil ? (
                  <img src={getFullImageUrl(user.fotoPerfil)} alt="Avatar" className="h-10 w-10 rounded-full object-cover border border-zinc-200 group-hover:border-[#007068] transition-colors" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 group-hover:border-[#007068] transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-sm shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-zinc-100 mb-2">
                      <p className="text-sm font-bold text-zinc-900 truncate">{user?.nombre || "Usuario"}</p>
                      <p className="text-xs text-zinc-500 capitalize">{user?.rol || "Miembro"}</p>
                    </div>
                    <Link
                      href="/perfil"
                      className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/favoritos"
                      className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mis Favoritos
                    </Link>
                    <div className="border-t border-zinc-100 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-zinc-700 font-bold hover:bg-zinc-100 text-sm rounded-sm">Ingresar</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#007068] text-white hover:bg-[#005a54] rounded-sm px-5 text-sm font-bold shadow-sm">Crear cuenta</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden ml-2 rounded-sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-zinc-200 p-4 shadow-lg md:hidden flex flex-col gap-4 z-40">
          <Link href="/" className="font-medium text-zinc-700 p-2 hover:bg-zinc-50 rounded-sm">Inicio</Link>
          <Link href="/explorar" className="font-medium text-zinc-700 p-2 hover:bg-zinc-50 rounded-sm">Explorar</Link>
          {isAuthenticated && <Link href="/perfil" className="font-medium text-zinc-700 p-2 hover:bg-zinc-50 rounded-sm">Mi Perfil</Link>}
        </div>
      )}
    </nav>
  );
}
