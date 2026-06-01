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
    <div className="md:hidden relative">
      {/* Botón del menú hamburguesa */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors relative" 
        title={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        
        {/* Punto rojo parpadeante en el botón cerrado si hay solicitudes en espera */}
        {!isOpen && cantidadPendientes > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </button>

      {/* Menú desplegable móvil */}
      {isOpen && (
        <>
          {/* Capa oscura transparente para cerrar el menú al tocar fuera */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={handleLinkClick} />
          
          {/* Contenedor flotante del menú */}
          <div className="fixed top-16 left-4 w-72 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-1 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2 mb-2">
              Módulos
            </p>

            {/* Dashboard */}
            <Link 
              href="/protected" 
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-teal-50/60 dark:bg-teal-950/30 text-[#0d9488] dark:text-teal-400"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            {/* Mascotas */}
            <Link 
              href="/protected/mascotas" 
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <PawPrint className="h-4 w-4 shrink-0" />
              <span>Pacientes / Mascotas</span>
            </Link>

            {/* Citas */}
            <Link 
              href="/protected/citas" 
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Agenda de Citas</span>
            </Link>

            {/* Inventario */}
            <Link 
              href="/protected/inventario" 
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <Package className="h-4 w-4 shrink-0" />
              <span>Inventario / Stock</span>
            </Link>

            {/* Administración */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider pl-2 mb-2">
                Administración
              </p>
              <Link 
                href="/protected/usuarios" 
                onClick={handleLinkClick}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Aprobaciones Pendientes</span>
                </div>
                
                {/* El círculo con el número de solicitudes en el móvil */}
                {cantidadPendientes > 0 && (
                  <span className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold px-2.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center">
                    {cantidadPendientes}
                  </span>
                )}
              </Link>
            </div>

            {/* Configuración */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-1">
              <Link 
                href="/protected/ajustes" 
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Ajustes del Sistema</span>
              </Link>
            </div>

          </div>
        </>
      )}
    </div>
  );
}