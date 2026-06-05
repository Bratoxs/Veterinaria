"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { Search, ArrowLeft, User, Fingerprint, Phone, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

interface Rol {
  id: string;
  nombre: string;
}

// 🚀 Usamos Pick para extraer exactamente los campos editables y mapear el tipo del servidor
type CamposEditables = Pick<Usuario, "nombre" | "apellido" | "celular" | "rol_id" | "estado">;

interface Props {
  usuariosIniciales: Usuario[];
  roles: Rol[];
  onActualizarUsuario: (id: string, data: CamposEditables) => Promise<string>;
}

export default function UsuariosEditClient({ 
  usuariosIniciales = [], 
  roles = [], 
  onActualizarUsuario 
}: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [isPending, startTransition] = useTransition();

  // Control de visibilidad exclusiva para celulares
  const [verFormularioMovil, setVerFormularioMovil] = useState(false);

  // Estados locales controlados para el formulario
  const [formNombre, setFormNombre] = useState("");
  const [formApellido, setFormApellido] = useState("");
  const [formCelular, setFormCelular] = useState("");
  const [formRolId, setFormRolId] = useState("");
  const [formEstado, setFormEstado] = useState<Usuario["estado"]>("aprobado");

  // Función encargada de cargar los datos planos del usuario activo en los inputs
  const cargarUsuarioEnFormulario = (usr: Usuario) => {
    setUsuarioSeleccionado(usr);
    setFormNombre(usr.nombre || "");
    setFormApellido(usr.apellido || "");
    setFormCelular(usr.celular || "");
    setFormRolId(usr.rol_id || "");
    setFormEstado(usr.estado);
  };

  // En PC, autoselecciona el primer registro de la lista al cargar el componente
  useEffect(() => {
    if (usuarios.length > 0 && !usuarioSeleccionado) {
      cargarUsuarioEnFormulario(usuarios[0]);
    }
  }, [usuarios, usuarioSeleccionado]);

  // Buscador reactivo por coincidencia de texto
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usr =>
      `${usr.nombre || ""} ${usr.apellido || ""}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      (usr.correo || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [usuarios, busqueda]);

  const handleSeleccionarUsuario = (usr: Usuario) => {
    cargarUsuarioEnFormulario(usr);
    setVerFormularioMovil(true);
  };

  const handleGuardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;

    startTransition(async () => {
      try {
        const payload: CamposEditables = {
          nombre: formNombre,
          apellido: formApellido,
          celular: formCelular,
          rol_id: formRolId || null,
          estado: formEstado,
        };

        const msg = await onActualizarUsuario(usuarioSeleccionado.id, payload);
        toast.success(msg || "Perfil guardado con éxito");

        // Actualizar el estado local mutando solo el usuario editado para evitar parpadeos
        setUsuarios(prev => prev.map(u => u.id === usuarioSeleccionado.id ? { ...u, ...payload } : u));
        
        // Si se encuentra en resolución móvil, regresa a la lista automáticamente al terminar
        if (window.innerWidth < 1024) {
          setVerFormularioMovil(false);
        }
      } catch (error) {
        console.error("❌ Error al guardar datos:", error);
        toast.error("Ocurrió un error al procesar la actualización");
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-xs font-sans text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 min-h-screen">
      
      {/* Encabezado Principal */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Mantenimiento de Usuarios
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Modifica la información básica, reasigna roles operativos o gestiona las suspensiones de cuentas activas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: LISTADO */}
        <div className={cn(
          "lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4",
          verFormularioMovil ? "hidden lg:block" : "block"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Personal Registrado</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-[11px]">
                {usuariosFiltrados.length}
              </span>
            </h2>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por datos o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((usr) => {
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
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize truncate">
                          {usr.nombre} {usr.apellido}
                        </p>
                        {usr.estado === "suspendido" && (
                          <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                            Suspendido
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] truncate">
                        {usr.correo}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 font-mono">
                        C.I: {usr.cedula || "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-slate-400 dark:text-slate-500">No se encontraron usuarios.</p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO */}
        <div className={cn(
          "lg:col-span-7 space-y-4",
          verFormularioMovil ? "block" : "hidden lg:block"
        )}>
          
          {usuarioSeleccionado ? (
            <form onSubmit={handleGuardarCambios} className="space-y-4">
              
              {/* Botón de retorno exclusivo para celulares */}
              <button
                type="button"
                onClick={() => setVerFormularioMovil(false)}
                className="lg:hidden flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-2 rounded-xl border border-teal-100 dark:border-teal-900 mb-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a la lista de usuarios
              </button>

              {/* Tarjeta Visual de Perfil */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 relative">
                {isPending && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-950 shadow-md border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin" /> Guardando en base de datos...
                    </div>
                  </div>
                )}

                <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-lg font-bold flex items-center justify-center uppercase shrink-0">
                  {formNombre?.[0] || ""}{formApellido?.[0] || ""}
                </div>
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize truncate">
                    {formNombre || "---"} {formApellido || "---"}
                  </h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-mono truncate">{usuarioSeleccionado.correo}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                    Cuenta registrada: <span className="font-mono text-slate-600 dark:text-slate-400">{usuarioSeleccionado.created_at ? new Date(usuarioSeleccionado.created_at).toLocaleDateString("es-EC") : "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Formulario de Datos Personales */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Información del Perfil</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" /> Nombres
                    </label>
                    <input
                      type="text" required value={formNombre} onChange={(e) => setFormNombre(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-800 dark:text-slate-200 font-medium focus:border-teal-500 dark:focus:border-teal-600 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" /> Apellidos
                    </label>
                    <input
                      type="text" required value={formApellido} onChange={(e) => setFormApellido(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-800 dark:text-slate-200 font-medium focus:border-teal-500 dark:focus:border-teal-600 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Fingerprint className="h-3 w-3 text-slate-400" /> Identificación (Cédula)
                    </label>
                    <input
                      type="text" readOnly value={usuarioSeleccionado.cedula || "N/A"}
                      className="w-full bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-500 dark:text-slate-500 font-mono cursor-default focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" /> Teléfono Celular
                    </label>
                    <input
                      type="text" value={formCelular} onChange={(e) => setFormCelular(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-800 dark:text-slate-200 font-medium focus:border-teal-500 dark:focus:border-teal-600 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Roles e Inhabilitación */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Permisos corporativos</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Rol Asignado</label>
                    <select
                      value={formRolId} onChange={(e) => setFormRolId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-3 font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-xs"
                    >
                      <option value="">Sin Rol Asignado</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>💼 {rol.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Estado de Cuenta</label>
                    <select
                      value={formEstado} onChange={(e) => setFormEstado(e.target.value as Usuario["estado"])}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-3 font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-xs"
                    >
                      <option value="aprobado">🟢 Activo / Autorizado</option>
                      <option value="suspendido">🔴 Suspendido / Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Guardar Cambios de Perfil
                  </button>
                </div>

              </div>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
              Selecciona un colaborador de la lista para gestionar sus credenciales.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}