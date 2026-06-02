"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, 
  X,
  LayoutDashboard, 
  PawPrint, 
  Calendar, 
  Package, 
  Settings, 
  ShieldAlert 
} from "lucide-react";

interface MobileMenuProps {
  cantidadPendientes?: number;
}

export function MobileMenu({ cantidadPendientes = 0 }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Botón del menú hamburguesa */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors relative z-50" 
        title={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        
        {/* Punto rojo parpadeante en el botón cerrado si hay solicitudes en espera */}
        {!isOpen && cantidadPendientes > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </button>

      {/* CAPA OSCURA TRASLÚCIDA (Backdrop) */}
      <div 
        onClick={handleLinkClick}
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} 
      />
      
      {/* MENU LATERAL ESTILO GEMINI (Sidebar completo) */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-80 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-1 z-50 transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Encabezado dentro del Sidebar Móvil */}
        <div className="h-14 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 mb-4 shrink-0">
          <Link href="/protected" onClick={handleLinkClick} className="text-[#0d9488] font-bold text-lg tracking-wider flex items-center gap-2">
            <span>🐾</span> VetCare
          </Link>
          {/* Botón opcional para cerrar dentro del menú si el usuario quiere */}
          <button 
            onClick={handleLinkClick}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Zona de navegación scrollable por si hay muchas opciones */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2 mb-2">
            Módulos
          </p>

          {/* Dashboard */}
          <Link 
            href="/protected" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold bg-teal-50/60 dark:bg-teal-950/30 text-[#0d9488] dark:text-teal-400 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* Mascotas */}
          <Link 
            href="/protected/mascotas" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <PawPrint className="h-4 w-4 shrink-0" />
            <span>Pacientes / Mascotas</span>
          </Link>

          {/* Citas */}
          <Link 
            href="/protected/citas" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Agenda de Citas</span>
          </Link>

          {/* Inventario */}
          <Link 
            href="/protected/inventario" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Package className="h-4 w-4 shrink-0" />
            <span>Inventario / Stock</span>
          </Link>

          {/* Administración */}
          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/60">
            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider pl-2 mb-2">
              Administración
            </p>
            <Link 
              href="/protected/usuarios" 
              onClick={handleLinkClick}
              className="flex items-center justify-between px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Aprobaciones Pendientes</span>
              </div>
              
              {/* El círculo numérico */}
              {cantidadPendientes > 0 && (
                <span className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold px-2.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center">
                  {cantidadPendientes}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Configuración fija en la parte inferior */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 shrink-0">
          <Link 
            href="/protected/ajustes" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Ajustes del Sistema</span>
          </Link>
        </div>

      </div>
    </div>
  );
}