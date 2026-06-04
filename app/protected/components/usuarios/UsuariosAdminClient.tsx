"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { UserCheck, UserX, Phone, Search, Fingerprint, User, Activity, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Definimos la estructura de usuario que viene de Supabase
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

// Definimos la estructura del Rol que viene de Supabase
interface Rol {
  id: string;
  nombre: string;
}

interface Props {
  usuarios?: Usuario[];
  roles: Rol[];
  adminId?: string;
  onConcederAcceso: (id: string, rolId: string) => Promise<string>;
  onRechazarAcceso: (id: string) => Promise<string>;
}

export default function UsuariosAdminClient({ 
  usuarios = [], 
  roles = [],
  onConcederAcceso,
  onRechazarAcceso 
}: Props) {
  
  const solicitudesPendientes = useMemo(() => {
    return usuarios.filter(u => u.estado === "pendiente");
  }, [usuarios]);

  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Controla si en móvil se forzó la vista del detalle
  const [verDetalleMovil, setVerDetalleMovil] = useState(false);

  // Sincroniza el usuario seleccionado cuando la data fresca llega del servidor
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
      setVerDetalleMovil(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudesPendientes]);

  // Sincroniza el select del rol corporativo cada vez que cambia el usuario auditado
  useEffect(() => {
    if (usuarioSeleccionado) {
      setRolSeleccionado(usuarioSeleccionado.rol_id || "");
    }
  }, [usuarioSeleccionado]);

  const solicitudesFiltradas = useMemo(() => {
    return solicitudesPendientes.filter(usr => 
      `${usr.nombre || ""} ${usr.apellido || ""}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      (usr.correo || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [solicitudesPendientes, busqueda]);

  const handleSeleccionarUsuario = (usr: Usuario) => {
    setUsuarioSeleccionado(usr);
    setVerDetalleMovil(true); // Abre el detalle a pantalla completa en celulares
  };

  const handleAprobar = () => {
    if (!usuarioSeleccionado) return;
    startTransition(async () => {
      try {
        await onConcederAcceso(usuarioSeleccionado.id, rolSeleccionado);
        
        const restantes = solicitudesFiltradas.filter(u => u.id !== usuarioSeleccionado.id);
        if (restantes.length > 0) {
          setUsuarioSeleccionado(restantes[0]);
        } else {
          setUsuarioSeleccionado(null);
          setVerDetalleMovil(false);
        }
        toast.success("Usuario aprobado y acceso concedido con éxito");
      } catch (error) {
        console.error("❌ Error al aprobar usuario en servidor:", error);
        toast.error("Hubo un problema al procesar la aprobación");
      }
    });
  };

  const handleRechazar = () => {
    if (!usuarioSeleccionado) return;
    
    startTransition(async () => {
      try {
        const mensajeExito = await onRechazarAcceso(usuarioSeleccionado.id);
        toast.success(mensajeExito || "Acción realizada con éxito");
        
        const restantes = solicitudesPendientes.filter(u => u.id !== usuarioSeleccionado.id);
        if (restantes.length > 0) {
          setUsuarioSeleccionado(restantes[0]);
        } else {
          setUsuarioSeleccionado(null);
          setVerDetalleMovil(false);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        console.error("❌ Error al rechazar usuario en servidor:", errorMessage);
        toast.error(`Error al rechazar: ${errorMessage}`);
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 min-h-screen">
      
      {/* Encabezado contextual para saber exactamente dónde se encuentra el administrador */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Control de Accesos
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Audita, asigna roles corporativos y autoriza las nuevas solicitudes de ingreso al ecosistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: LISTA (Se oculta en móvil si verDetalleMovil es true) */}
        <div className={cn(
          "lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4",
          verDetalleMovil ? "hidden lg:block" : "block"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Solicitudes Pendientes</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-[11px]">
                {solicitudesFiltradas.length}
              </span>
            </h2>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map((usr) => {
                const esActivo = usuarioSeleccionado?.id === usr.id;
                return (
                  <div
                    key={usr.id}
                    onClick={() => handleSeleccionarUsuario(usr)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                      esActivo 
                        ? "border-teal-500 dark:border-teal-600 bg-teal-50/40 dark:bg-teal-950/20 ring-1 ring-teal-500/30" 
                        : "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {(usr.nombre?.[0] || "")}{(usr.apellido?.[0] || "")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize truncate">
                        {usr.nombre} {usr.apellido}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] truncate">
                        {usr.correo}
                      </p>
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

        {/* COLUMNA DERECHA: DETALLE (Se oculta en móvil si verDetalleMovil es false) */}
        <div className={cn(
          "lg:col-span-7 space-y-4",
          verDetalleMovil ? "block" : "hidden lg:block"
        )}>
          
          {usuarioSeleccionado ? (
            <>
              {/* Botón de regreso exclusivo para móviles */}
              <button
                onClick={() => setVerDetalleMovil(false)}
                className="lg:hidden flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-2 rounded-xl border border-teal-100 dark:border-teal-900 mb-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a la lista de solicitudes
              </button>

              {/* Tarjeta Perfil Superior */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 relative">
                
                {/* Overlay difuminado cuando el formulario procesa del lado del servidor (isPending) */}
                {isPending && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-950 shadow-md border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin" /> Procesando cambios...
                    </div>
                  </div>
                )}

                <div className="h-16 w-16 rounded-full bg-teal-600 text-xl font-bold text-white flex items-center justify-center uppercase shrink-0">
                  {usuarioSeleccionado.nombre?.[0] || "U"}{usuarioSeleccionado.apellido?.[0] || ""}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
                    {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{usuarioSeleccionado.correo}</p>
                
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1">
                    <span>Registrado: </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {usuarioSeleccionado.created_at ? (
                        (() => {
                          const fecha = new Date(usuarioSeleccionado.created_at);
                          if (isNaN(fecha.getTime())) return "Fecha inválida";
                          const fechaFormateada = fecha.toLocaleDateString("es-EC", {
                            day: "numeric", month: "long", year: "numeric",
                          });
                          let horas = fecha.getHours();
                          const minutos = fecha.getMinutes().toString().padStart(2, "0");
                          const ampm = horas >= 12 ? "PM" : "AM";
                          horas = horas % 12 || 12;
                          return `${fechaFormateada}, ${horas}:${minutos} ${ampm}`;
                        })()
                      ) : "Fecha no disponible"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Información de Registro</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Nombre de Usuario
                    </label>
                    <input
                      type="text" readOnly value={usuarioSeleccionado.username || "No provisto"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-700 dark:text-slate-300 font-medium cursor-default focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Estado de Solicitud
                    </label>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 flex items-center cursor-default">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                        {usuarioSeleccionado.estado}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Fingerprint className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Cédula de Identidad
                    </label>
                    <input
                      type="text" readOnly value={usuarioSeleccionado.cedula || "No provisto"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-700 dark:text-slate-300 font-mono font-medium cursor-default focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Teléfono Celular
                    </label>
                    <input
                      type="text" readOnly value={usuarioSeleccionado.celular || "No provisto"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-700 dark:text-slate-300 font-medium cursor-default focus:outline-none"
                    />
                  </div>

                </div>
              </div>

              {/* Acciones */}
              <div className="bg-emerald-50/10 dark:bg-emerald-950/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Configuración de Acceso</h3>
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Asignar Rol Corporativo</label>
                  <select
                    value={rolSeleccionado}
                    onChange={(e) => setRolSeleccionado(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-3 font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-xs shadow-sm"
                  >
                    <option value="">⚠️ Selecciona un rol antes de aprobar</option>
                    
                    {/* Mapeo dinámico desde la tabla de roles en Supabase */}
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        💼 {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isPending || !rolSeleccionado}
                    onClick={handleAprobar}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <UserCheck className="h-4 w-4" />
                    Aprobar y Dar Acceso
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleRechazar}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <UserX className="h-4 w-4" />
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