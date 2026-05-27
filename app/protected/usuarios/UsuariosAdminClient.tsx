"use client";

import { useState, useTransition, useEffect } from "react";
import { UserCheck, Phone, FileText, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Usuario {
  id: string;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string; 
  rol_id: string | null;
  estado: "pendiente" | "aprobado" | "rechazado" | "suspendido";
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
  
  const solicitudesPendientes = usuariosIniciales.filter(u => u.estado === "pendiente");
  
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(
    solicitudesPendientes.length > 0 ? solicitudesPendientes[0] : null
  );
  
  const [rolSeleccionado, setRolSeleccionado] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (usuarioSeleccionado) {
      setRolSeleccionado(usuarioSeleccionado.rol_id || "");
    }
  }, [usuarioSeleccionado]);

  const solicitudesFiltradas = solicitudesPendientes.filter(usr => 
    `${usr.nombre || ""} ${usr.apellido || ""}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    (usr.correo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-700 bg-slate-50/50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: LISTA */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Solicitudes Pendientes ({solicitudesFiltradas.length})
            </h2>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 transition-colors"
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
                        ? "border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/30" 
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {(usr.nombre?.[0] || "")}{(usr.apellido?.[0] || "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm capitalize truncate">
                        {usr.nombre} {usr.apellido}
                      </p>
                      <p className="text-slate-400 text-[11px] truncate">{usr.correo}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Registrado: Reciente</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-slate-400">No hay aprobaciones pendientes.</p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: DETALLE */}
        <div className="lg:col-span-7 space-y-4">
          {usuarioSeleccionado ? (
            <>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                <div className="h-16 w-16 rounded-full bg-slate-300 flex items-center justify-center text-xl font-bold text-white uppercase shrink-0">
                  {usuarioSeleccionado.nombre?.[0] || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-1.5">
                    {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                  </h2>
                  <p className="text-slate-500 text-xs font-mono">{usuarioSeleccionado.correo}</p>
                  <p className="text-slate-400 text-[10px] mt-1">Registrado de forma remota via Web</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Información Adicional del Registro</h3>
                  <p className="text-slate-400 text-[11px]">Datos capturados dinámicamente en el formulario.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" /> Teléfono Celular
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={usuarioSeleccionado.celular || "No provisto"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-slate-700 font-medium cursor-default focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-600 block">Documentos cargados</label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>Verificación_Identidad.pdf</span>
                    </div>
                    <button type="button" className="text-slate-400 hover:text-slate-600">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/20 border border-emerald-500/20 rounded-2xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Configuración de Acceso y Rol</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Asignar Rol Corporativo</label>
                  <select
                    value={rolSeleccionado}
                    onChange={(e) => setRolSeleccionado(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl h-11 px-3 font-semibold text-slate-700 outline-none cursor-pointer focus:border-teal-500 transition-colors text-xs shadow-sm"
                  >
                    <option value="">⚠️ Selecciona un rol antes de aprobar</option>
                    <option value="ID_REAL_VETERINARIO">👨‍⚕️ Veterinario</option>
                    <option value="ID_REAL_ADMINISTRADOR">👑 Administrador</option>
                    <option value="ID_REAL_RECEPCIONISTA">📋 Recepcionista</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isPending || !rolSeleccionado}
                    onClick={handleAprobar}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <UserCheck className="h-4 w-4" />
                    Aprobar y Dar Acceso
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleRechazar}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-11 px-5 rounded-xl transition-all active:scale-95"
                  >
                    Rechazar Solicitud
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 font-medium">
              Selecciona un usuario de la lista izquierda para auditar su información.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}