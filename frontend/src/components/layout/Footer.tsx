import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-zinc-800 py-16 text-sm text-zinc-400">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="font-bold text-white text-2xl tracking-tighter">JIWASA.</h3>
          <p className="max-w-xs">
            Descubre los sabores auténticos de La Paz. Tu guía gastronómica de confianza para puestos de calle, mercados y restaurantes.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Descubrir</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="hover:text-white hover:underline decoration-1 underline-offset-4">Restaurantes</Link></li>
            <li><Link href="#" className="hover:text-white hover:underline decoration-1 underline-offset-4">Comida Callejera</Link></li>
            <li><Link href="#" className="hover:text-white hover:underline decoration-1 underline-offset-4">Mercados</Link></li>
            <li><Link href="#" className="hover:text-white hover:underline decoration-1 underline-offset-4">Cafés</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Legal</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="hover:text-white hover:underline decoration-1 underline-offset-4">Términos de servicio</Link></li>
            <li><Link href="#" className="hover:text-white hover:underline decoration-1 underline-offset-4">Privacidad</Link></li>
            <li><Link href="#" className="hover:text-white hover:underline decoration-1 underline-offset-4">Cookies</Link></li>
          </ul>
        </div>
        
         <div className="space-y-4">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Síguenos</h4>
           <div className="flex gap-4">
                {/* Social Placeholders */}
                <span className="w-10 h-10 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors cursor-pointer flex items-center justify-center">📷</span>
                <span className="w-10 h-10 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors cursor-pointer flex items-center justify-center">🐦</span>
                <span className="w-10 h-10 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors cursor-pointer flex items-center justify-center">📘</span>
           </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-500">
          © 2024 JIWASA. Hecho con ❤️ en La Paz.
      </div>
    </footer>
  );
}
