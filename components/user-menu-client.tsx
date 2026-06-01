"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { LogoutButton } from "./logout-button";

interface UserMenuClientProps {
  fullName: string;
}

export function UserMenuClient({ fullName }: UserMenuClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú automáticamente si el usuario hace clic afuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      ref={menuRef}
      className="relative flex items-center gap-2"
      // En PC se abre y se cierra con Hover de forma fluida
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      
      {/* Botón del Perfil: En celular se abre/cierra con un toque (onClick) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer select-none outline-none"
      >
        {/* Icono médico circular */}
        <div className="h-8 w-8 rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-sm shrink-0 text-sm">
          🩺
        </div>

        {/* Texto de Bienvenida Dinámico */}
        <div className="hidden md:flex flex-col text-xs leading-tight">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Bienvenido,</span>
          <span className="text-slate-700 dark:text-slate-200 font-semibold max-w-[120px] truncate capitalize">
            {fullName}
          </span>
        </div>

        {/* Flecha indicadora que rota perfectamente si el menú está abierto */}
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* LISTA DESPLEGABLE: Controlada por el estado de React */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
          onClick={() => setIsOpen(false)} // 👈 ¡ESTE ES EL TRUCO! Al hacer clic en cualquier opción (o Logout), el menú se destruye y se cierra
        >
          <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Mi Cuenta
          </div>

          <div className="px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Rol: Administrador</span>
          </div>

          <hr className="my-1.5 border-slate-100 dark:border-slate-800" />

          <div className="px-2">
            <LogoutButton />
          </div>
        </div>
      )}

    </div>
  );
}