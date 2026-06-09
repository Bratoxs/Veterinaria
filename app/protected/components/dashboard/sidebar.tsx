// components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert, 
  FolderHeart, 
  UserCog      
} from "lucide-react";

interface SidebarProps {
  cantidadPendientes?: number;
}

export function Sidebar({ cantidadPendientes = 0 }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`h-full hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 relative transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 text-slate-500 hover:text-[#0d9488] shadow-sm z-50 transition-colors"
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div
        className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 transition-all ${
          isCollapsed ? "justify-center px-0" : "px-6"
        }`}
      >
        <Link
          href="/protected"
          className="text-[#0d9488] font-bold text-lg tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="bg-teal-50 dark:bg-teal-950/50 p-1.5 rounded-lg text-base shrink-0">🐾</span>
          {!isCollapsed && <span className="animate-fadeIn">VetCare</span>}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p
          className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-3 mb-2 transition-opacity ${
            isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
          }`}
        >
          Módulos
        </p>

        {/* Dashboard */}
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

        {/* Único Acceso Maestro Unificado */}
        <Link
          href="/protected/propietarios"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all ${
            isCollapsed ? "justify-center" : ""
          }`}
          title="Expedientes Clínicos"
        >
          <FolderHeart className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
          {!isCollapsed && <span className="animate-fadeIn">Expedientes Clínicos</span>}
        </Link>

        {/* Citas */}
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

        {/* Inventario */}
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

        {/* Administración */}
        <div className="pt-2 space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider pl-3 mb-2 animate-fadeIn">
              Administración
            </p>
          )}
          
          <Link
            href="/protected/accesos"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all justify-between ${
              isCollapsed ? "justify-center relative" : ""
            }`}
            title="Aprobaciones / Roles"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {isCollapsed && cantidadPendientes > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                    {cantidadPendientes}
                  </span>
                )}
              </div>
              {!isCollapsed && <span className="animate-fadeIn">Aprobaciones Pendientes</span>}
            </div>

            {!isCollapsed && cantidadPendientes > 0 && (
              <span className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold px-2 py-0.5 rounded-full text-[10px] min-w-[18px] text-center">
                {cantidadPendientes}
              </span>
            )}
          </Link>

          <Link
            href="/protected/usuarios"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:text-teal-600 dark:hover:text-teal-400 transition-all ${
              isCollapsed ? "justify-center relative" : ""
            }`}
            title="Gestión de Personal"
          >
            <div className="flex items-center gap-3">
              <UserCog className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="animate-fadeIn">Personal de Veterinaria</span>}
            </div>
          </Link>
        </div>

        {/* Configuración */}
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