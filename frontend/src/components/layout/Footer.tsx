import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-20 pb-10 text-sm">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">

        {/* Brand Column */}
        <div className="space-y-6">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
              JIWASA<span className="text-[#007068]">.</span>
            </span>
          </Link>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-xs">
            Descubre los sabores auténticos de La Paz. Tu guía gastronómica premium para explorar lo mejor de nuestra cultura culinaria.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a href="#" className="bg-white dark:bg-zinc-900 p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-[#007068] hover:bg-[#007068]/10 hover:scale-110 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="bg-white dark:bg-zinc-900 p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-[#007068] hover:bg-[#007068]/10 hover:scale-110 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="bg-white dark:bg-zinc-900 p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-[#007068] hover:bg-[#007068]/10 hover:scale-110 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Links Column */}
        <div className="space-y-6">
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">Descubrir</h4>
          <ul className="space-y-3">
            <li><Link href="/explorar" className="text-zinc-500 dark:text-zinc-400 hover:text-[#007068] dark:hover:text-[#007068] font-medium transition-colors inline-flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-[#007068] transition-colors"></span> Restaurantes</Link></li>
            <li><Link href="/explorar" className="text-zinc-500 dark:text-zinc-400 hover:text-[#007068] dark:hover:text-[#007068] font-medium transition-colors inline-flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-[#007068] transition-colors"></span> Comida Callejera</Link></li>
            <li><Link href="/explorar" className="text-zinc-500 dark:text-zinc-400 hover:text-[#007068] dark:hover:text-[#007068] font-medium transition-colors inline-flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-[#007068] transition-colors"></span> Mercados</Link></li>
            <li><Link href="/explorar" className="text-zinc-500 dark:text-zinc-400 hover:text-[#007068] dark:hover:text-[#007068] font-medium transition-colors inline-flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-[#007068] transition-colors"></span> Cafés</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-6">
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">Contacto</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-zinc-500 dark:text-zinc-400 font-medium">
              <MapPin className="h-5 w-5 text-[#007068] shrink-0 mt-0.5" />
              <span>Av. Mariscal Santa Cruz,<br />La Paz, Bolivia</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 font-medium">
              <Mail className="h-5 w-5 text-[#007068] shrink-0" />
              <a href="mailto:hola@jiwasa.bo" className="hover:text-[#007068] transition-colors">erickbreack72@gmail.com</a>
            </li>
            <li className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 font-medium">
              <Phone className="h-5 w-5 text-[#007068] shrink-0" />
              <a href="tel:+5912222222" className="hover:text-[#007068] transition-colors">+591 79611475</a>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="space-y-6">
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">Legal</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-[#007068] dark:hover:text-[#007068] font-medium transition-colors">Términos de servicio</Link></li>
            <li><Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-[#007068] dark:hover:text-[#007068] font-medium transition-colors">Política de Privacidad</Link></li>
            <li><Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-[#007068] dark:hover:text-[#007068] font-medium transition-colors">Política de Cookies</Link></li>
          </ul>
        </div>

      </div>

      <div className="container mx-auto px-6 mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 dark:text-zinc-500 font-medium text-xs">
            © {new Date().getFullYear()} JIWASA. Todos los derechos reservados.
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 font-medium text-xs flex items-center gap-1.5">
            Hecho con <span className="text-red-500 animate-pulse">❤️</span> en La Paz
          </p>
        </div>
      </div>
    </footer>
  );
}
