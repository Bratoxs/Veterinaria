"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { UserCheck, Phone, Search, Fingerprint, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Usuario {
  id: string;
  cedula: string;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string; 
  rol_id: string | null;
  estado: "pendiente" | "aprobado" | "rechazado" | "suspendido";
  created_at: string | null;
}

interface Props {
  usuariosIniciales?: Usuario[];
  adminId?: string;
  onCambiarRol: (id: string, rolId: string) => Promise<void>;
  onConcederAcceso: (id: string) => Promise<void>;
  onRechazarAcceso: (id: string) => Promise<void>; 
}

export default function UsuariosAdminClient({ 
  usuariosIniciales = [], 
  onCambiarRol, 
  onConcederAcceso,
  onRechazarAcceso 
}: Props) {
  
  // 1. Memorizamos las solicitudes pendientes para que la referencia en memoria no cambie en cada render
  const solicitudesPendientes = useMemo(() => {
    return usuariosIniciales.filter(u => u.estado === "pendiente");
  }, [usuariosIniciales]);

  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // 🔄 1. Sincroniza el usuario seleccionado cuando la data fresca llega del servidor
  useEffect(() => {
    if (solicitudesPendientes.length > 0) {
      const todaviaExiste = solicitudesPendientes.find(u => u.id === usuarioSeleccionado?.id);
      
      if (!usuarioSeleccionado || !todaviaExiste) {
        setUsuarioSeleccionado(solicitudesPendientes[0]);
      } else if (JSON.stringify(todaviaExiste) !== JSON.stringify(usuarioSeleccionado)) {
        setUsuarioSeleccionado(todaviaExiste);
      }
    } else {
      setUsuarioSeleccionado(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudesPendientes]); // 👈 Ahora pasamos la referencia memorizada de forma segura

  // 🔄 2. Sincroniza el select del rol corporativo cada vez que cambia el usuario auditado
  useEffect(() => {
    if (usuarioSeleccionado) {
      setRolSeleccionado(usuarioSeleccionado.rol_id || "");
    }
  }, [usuarioSeleccionado]);

  // 3. Memorizamos también las solicitudes filtradas por búsqueda para mantener el rendimiento óptimo
  const solicitudesFiltradas = useMemo(() => {
    return solicitudesPendientes.filter(usr => 
      `${usr.nombre || ""} ${usr.apellido || ""}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      (usr.correo || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [solicitudesPendientes, busqueda]);

  const handleAprobar = () => {
    if (!usuarioSeleccionado) return;
    startTransition(async () => {
      await onCambiarRol(usuarioSeleccionado.id, rolSeleccionado);
      await onConcederAcceso(usuarioSeleccionado.id);
      
      const restantes = solicitudesFiltradas.filter(u => u.id !== usuarioSeleccionado.id);
      setUsuarioSeleccionado(restantes.length > 0 ? restantes[0] : null);
    });
  };

  const handleRechazar = () => {
    if (!usuarioSeleccionado) return;
    startTransition(async () => {
      await onRechazarAcceso(usuarioSeleccionado.id);
      
      const restantes = solicitudesFiltradas.filter(u => u.id !== usuarioSeleccionado.id);
      setUsuarioSeleccionado(restantes.length > 0 ? restantes[0] : null);
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: LISTA */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Solicitudes Pendientes ({solicitudesFiltradas.length})
            </h2>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map((usr) => {
                const esActivo = usuarioSeleccionado?.id === usr.id;
                return (
                  <div
                    key={usr.id}
                    onClick={() => setUsuarioSeleccionado(usr)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                      esActivo 
                        ? "border-teal-500 dark:border-teal-600 bg-teal-50/40 dark:bg-teal-950/20 ring-1 ring-teal-500/30" 
                        : "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-850"
                    )}
                  >
                    {/* Avatar con Iniciales */}
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {(usr.nombre?.[0] || "")}{(usr.apellido?.[0] || "")}
                    </div>

                    {/* Información del Usuario */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize truncate">
                        {usr.nombre} {usr.apellido}
                      </p>
                      
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] truncate">
                        {usr.correo}
                      </p>
                      
                      {/* Cédula agregada con diseño limpio */}
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">C.I:</span> 
                        <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-xs">
                          {usr.cedula || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-slate-400 dark:text-slate-500">No hay aprobaciones pendientes.</p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: DETALLE */}
        <div className="lg:col-span-7 space-y-4">
          {usuarioSeleccionado ? (
            <>
              {/* Tarjeta Perfil Superior */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="h-16 w-16 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-white dark:text-slate-200 uppercase shrink-0">
                  {usuarioSeleccionado.nombre?.[0] || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize flex items-center gap-1.5">
                    {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{usuarioSeleccionado.correo}</p>
                
                  {/* Fecha de Registro Dinámica */}
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                    <span>Registrado: </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {usuarioSeleccionado.created_at ? (
                        (() => {
                          const fecha = new Date(usuarioSeleccionado.created_at);
                          
                          // Si por alguna razón la fecha no es válida
                          if (isNaN(fecha.getTime())) return "Fecha inválida";

                          // Formato limpio: "25 de mayo de 2026"
                          const fechaFormateada = fecha.toLocaleDateString("es-EC", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          });

                          // Formato de hora manual para evitar los bugs de AM/PM de JavaScript
                          let horas = fecha.getHours();
                          const minutos = fecha.getMinutes().toString().padStart(2, "0");
                          const ampm = horas >= 12 ? "PM" : "AM";
                          
                          horas = horas % 12;
                          horas = horas ? horas : 12; // El formato '0' horas pasaría a ser '12'

                          return `${fechaFormateada}, ${horas}:${minutos} ${ampm}`;
                        })()
                      ) : (
                        "Fecha no disponible"
                      )}
                    </span>
                  </p>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Información Adicional del Registro</h3>
                </div>

                {/* Cambiamos a grid-cols-2 en pantallas medianas para que entren los 4 campos perfectamente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Input de Nombre de Usuario (Username) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={usuarioSeleccionado.username ? `${usuarioSeleccionado.username}` : "No provisto"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-700 dark:text-slate-300 font-medium cursor-default focus:outline-none"
                    />
                  </div>

                  {/* Estado de la Solicitud (Badge dinámico dentro de un contenedor estéril para mantener alineación) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Estado de Solicitud
                    </label>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 flex items-center cursor-default">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        usuarioSeleccionado.estado === "pendiente" && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50",
                        usuarioSeleccionado.estado === "aprobado" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50",
                        usuarioSeleccionado.estado === "rechazado" && "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                      )}>
                        {usuarioSeleccionado.estado}
                      </span>
                    </div>
                  </div>

                  {/* Input de Cédula */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Fingerprint className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Cédula de Identidad
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={usuarioSeleccionado.cedula || "No provisto"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-700 dark:text-slate-300 font-mono font-medium cursor-default focus:outline-none"
                    />
                  </div>

                  {/* Input de Celular */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Teléfono Celular
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={usuarioSeleccionado.celular || "No provisto"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-700 dark:text-slate-300 font-medium cursor-default focus:outline-none"
                    />
                  </div>

                </div>
              </div>

              {/* Panel de Configuración de Acceso y Rol */}
              <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Configuración de Acceso y Rol</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Asignar Rol Corporativo</label>
                  <select
                    value={rolSeleccionado}
                    onChange={(e) => setRolSeleccionado(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-3 font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-xs shadow-sm"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">⚠️ Selecciona un rol antes de aprobar</option>
                    <option value="ID_REAL_VETERINARIO" className="bg-white dark:bg-slate-900">👨‍⚕️ Veterinario</option>
                    <option value="ID_REAL_ADMINISTRADOR" className="bg-white dark:bg-slate-900">👑 Administrador</option>
                    <option value="ID_REAL_RECEPCIONISTA" className="bg-white dark:bg-slate-900">📋 Recepcionista</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isPending || !rolSeleccionado}
                    onClick={handleAprobar}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold h-11 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <UserCheck className="h-4 w-4" />
                    Aprobar y Dar Acceso
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleRechazar}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold h-11 px-5 rounded-xl transition-all active:scale-95"
                  >
                    Rechazar Solicitud
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
              Selecciona un usuario de la lista izquierda para auditar su información.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}