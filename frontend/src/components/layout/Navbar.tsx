"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Search, MapPin, Menu, User, LogOut, ChevronDown, Compass, Home, Map, ShoppingBag } from "lucide-react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowSearch(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isAuthenticated = !!user;

  // Determine if we should force dark mode styles (e.g. on Home)
  const isHome = pathname === "/";
  // The navbar is "transparent/dark-mode" ONLY if we are on Home AND haven't scrolled yet.
  const isTransparent = isHome && !isScrolled;

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full transition-all duration-500 h-20 flex items-center",
      isTransparent
        ? "bg-transparent border-transparent"
        : "bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-100"
    )}>
      <div className="container mx-auto flex h-full items-center justify-between px-6 gap-6">

        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="bg-gradient-to-br from-[#007068] to-[#004a45] text-white p-2.5 rounded-xl shadow-lg shadow-[#007068]/20 group-hover:shadow-[#007068]/40 group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <Compass className="h-5 w-5 relative z-10" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden md:flex flex-col -space-y-0.5">
            <span className={cn(
              "text-xl font-black tracking-tighter transition-colors leading-none",
              isTransparent ? "text-gray-600 drop-shadow-md" : "text-zinc-900"
            )}>
              JIWASA<span className="text-[#007068]">.</span>
            </span>
            <span className={cn(
              "text-[9px] font-bold tracking-[0.2em] uppercase leading-none",
              isTransparent ? "text-zinc-200 drop-shadow-sm" : "text-zinc-600"
            )}>Explora</span>
          </div>
        </Link>

        {/* Sticky Search Bar - Visible on Scroll */}
        {pathname === "/" && (
          <div className={cn(
            "flex-1 max-w-xl mx-6 transition-all duration-500 ease-out hidden md:block",
            showSearch ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          )}>
            <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-full shadow-sm hover:shadow-md transition-all h-12 px-2">
              <div className="flex-1 flex items-center px-4 h-full border-r border-zinc-200">
                <MapPin className="h-4 w-4 text-[#007068] shrink-0 mr-3" />
                <input
                  className="w-full text-sm font-bold bg-transparent outline-none text-zinc-800 placeholder:text-zinc-400 truncate"
                  placeholder="Ubicación"
                  defaultValue="La Paz"
                />
              </div>
              <div className="flex-[1.5] flex items-center px-4 h-full relative">
                <Search className="h-4 w-4 text-zinc-400 shrink-0 mr-3" />
                <input
                  className="w-full text-sm font-bold bg-transparent outline-none text-zinc-800 placeholder:text-zinc-400 truncate"
                  placeholder="Buscar..."
                />
              </div>
              <button className="bg-[#007068] hover:bg-[#005a54] text-white p-2 rounded-full transition-all shadow-sm">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 shrink-0">
          {/* Desktop Shortcuts */}
          {/* <div className="hidden md:flex items-center gap-2">
            {[
              { icon: Home, label: "Inicio", href: "/" },
              { icon: Map, label: "Mapa", href: "/mapa" },
              { icon: ShoppingBag, label: "Pedidos", href: "/pedidos" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300",
                  isTransparent
                    ? "text-zinc-100 hover:text-white hover:bg-white/20 drop-shadow-sm"
                    : "text-zinc-500 hover:text-[#007068] hover:bg-zinc-100"
                )}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div> */}

          {loading ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 bg-zinc-200 rounded-full"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none group cursor-pointer p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="hidden md:flex flex-col items-end mr-1 text-right">
                  <span className={cn(
                    "text-sm font-bold leading-none transition-colors",
                    isTransparent ? "text-zinc-700 group-hover:text-[#007068]" : "text-zinc-900"
                  )}>{user?.nombre?.split(' ')[0]}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isTransparent ? "text-zinc-400" : "text-zinc-500"
                  )}>{user?.rol}</span>
                </div>
                {user?.fotoPerfil ? (
                  <img src={getFullImageUrl(user.fotoPerfil)} alt="Avatar" className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform" />
                ) : (
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center ring-2 shadow-sm transition-all",
                    isTransparent ? "bg-white/10 text-white ring-white/20" : "bg-zinc-100 text-zinc-500 ring-white"
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                )}
                <ChevronDown className={cn("h-4 w-4 transition-colors", isTransparent ? "text-zinc-400 group-hover:text-white" : "text-zinc-600")} />
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-zinc-100 rounded-2xl shadow-xl shadow-zinc-200/50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-5 py-4 border-b border-zinc-100 mb-2 bg-zinc-50/50">
                      <p className="text-sm font-extrabold text-zinc-900 truncate">{user?.nombre}</p>
                      <p className="text-xs font-medium text-zinc-500">{user?.email}</p>
                    </div>
                    <div className="px-2 space-y-1">
                      <Link href="/perfil" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all">
                        <User className="h-4 w-4" /> Mi Perfil
                      </Link>
                      <Link href="/favoritos" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all">
                        <div className="scale-75 text-red-500">❤️</div> Mis Favoritos
                      </Link>
                    </div>
                    <div className="border-t border-zinc-100 my-2 pt-2 px-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all text-left">
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
                <Button variant="ghost" className={cn("font-bold text-sm rounded-full px-5 transition-colors", isTransparent ? "text-white hover:bg-white/20 drop-shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900")}>Ingresar</Button>
              </Link>
              <Link href="/auth/register">
                <Button className={cn(
                  "rounded-full px-6 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95",
                  isTransparent
                    ? "bg-white text-emerald-900 hover:bg-zinc-100" // Inverted for Hero
                    : "bg-[#007068] text-white hover:bg-[#005a54] shadow-[#007068]/20"
                )}>
                  Crear cuenta
                </Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className={cn("md:hidden ml-1 rounded-full", isTransparent ? "text-white hover:bg-white/10" : "text-zinc-900 hover:bg-zinc-100")} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
