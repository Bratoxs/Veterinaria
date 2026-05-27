"use client"; // 1. Indispensable para usar useState y eventos de click

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  PawPrint, 
  Calendar, 
  Package, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert // Icono ideal para administración, aprobación y roles
} from "lucide-react";

export function Sidebar() {
  // Estado para controlar si el sidebar está comprimido o no
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`h-full hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 relative transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* BOTÓN FLOTANTE PARA COMPRIMIR/EXPANDIR (La Flecha) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 text-slate-500 hover:text-[#0d9488] shadow-sm z-50 transition-colors"
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* CABECERA: LOGO / ICONO */}
      <div className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 transition-all ${
        isCollapsed ? "justify-center px-0" : "px-6"
      }`}>
        <Link href="/protected" className="text-[#0d9488] font-bold text-lg tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="bg-teal-50 dark:bg-teal-950/50 p-1.5 rounded-lg text-base shrink-0">🐾</span>
          {/* Ocultamos el texto suavemente si está colapsado */}
          {!isCollapsed && <span className="animate-fadeIn">VetCare</span>}
        </Link>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-3 mb-2 transition-opacity ${
          isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
        }`}>
          Módulos
        </p>
        
        {/* Enlace: Dashboard */}
        <Link 
          href="/protected" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-teal-50/60 dark:bg-teal-950/30 text-[#0d9488] dark:text-teal-400 transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Dashboard"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="animate-fadeIn">Dashboard</span>}
        </Link>

        {/* Enlace: Mascotas */}
        <Link 
          href="/protected/mascotas" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Pacientes / Mascotas"
        >
          <PawPrint className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="animate-fadeIn">Pacientes / Mascotas</span>}
        </Link>

        {/* Enlace: Citas */}
        <Link 
          href="/protected/citas" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Agenda de Citas"
        >
          <Calendar className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="animate-fadeIn">Agenda de Citas</span>}
        </Link>

        {/* Enlace: Inventario */}
        <Link 
          href="/protected/inventario" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Inventario / Stock"
        >
          <Package className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="animate-fadeIn">Inventario / Stock</span>}
        </Link>

        {/* 🆕 NUEVO SECTOR: Gestión del Administrador */}
        <div className="pt-2">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider pl-3 mb-2 animate-fadeIn">
              Administración
            </p>
          )}
          <Link 
            href="/protected/usuarios" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Aprobaciones / Roles"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="animate-fadeIn">Aprobaciones Pendientes</span>}
          </Link>
        </div>

        {/* Separador de configuración */}
        <div className="pt-4">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-3 mb-2 animate-fadeIn">
              Configuración
            </p>
          )}
          <Link 
            href="/protected/ajustes" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Ajustes del Sistema"
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="animate-fadeIn">Ajustes del Sistema</span>}
          </Link>
        </div>
      </nav>
    </aside>
  );
}