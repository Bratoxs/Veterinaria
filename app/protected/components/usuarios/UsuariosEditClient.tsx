"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  User,
  Fingerprint,
  Phone,
  Save,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";
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

type CamposEditables = Pick<
  Usuario,
  "nombre" | "apellido" | "celular" | "rol_id" | "estado"
>;

interface Props {
  usuariosIniciales: Usuario[];
  roles: Rol[];
  onActualizarUsuario: (id: string, data: CamposEditables) => Promise<string>;
}

export default function UsuariosEditClient({
  usuariosIniciales = [],
  roles = [],
  onActualizarUsuario,
}: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);
  const [isPending, startTransition] = useTransition();

  const [verFormularioMovil, setVerFormularioMovil] = useState(false);

  const [formNombre, setFormNombre] = useState("");
  const [formApellido, setFormApellido] = useState("");
  const [formCelular, setFormCelular] = useState("");
  const [formRolId, setFormRolId] = useState("");
  const [formEstado, setFormEstado] = useState<Usuario["estado"]>("aprobado");

  const cargarUsuarioEnFormulario = (usr: Usuario) => {
    setUsuarioSeleccionado(usr);
    setFormNombre(usr.nombre || "");
    setFormApellido(usr.apellido || "");
    setFormCelular(usr.celular || "");
    setFormRolId(usr.rol_id || "");
    setFormEstado(usr.estado);
  };

  // 1. Sincroniza los inputs del formulario cuando cambia el usuario seleccionado o mutan sus datos
  useEffect(() => {
    if (usuarioSeleccionado) {
      const actual = usuarios.find((u) => u.id === usuarioSeleccionado.id);
      if (actual) {
        setFormNombre(actual.nombre || "");
        setFormApellido(actual.apellido || "");
        setFormCelular(actual.celular || "");
        setFormRolId(actual.rol_id || "");
        setFormEstado(actual.estado);
      }
    }
  }, [usuarioSeleccionado, usuarios]);

  // 2. Autoselecciona el primer registro si la lista tiene datos y no hay una selección activa
  useEffect(() => {
    if (usuarios.length > 0 && !usuarioSeleccionado) {
      cargarUsuarioEnFormulario(usuarios[0]);
    } else if (usuarios.length === 0) {
      setUsuarioSeleccionado(null);
    }
  }, [usuarios, usuarioSeleccionado]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(
      (usr) =>
        `${usr.nombre || ""} ${usr.apellido || ""}`
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||
        (usr.correo || "").toLowerCase().includes(busqueda.toLowerCase()),
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

        setUsuarios((prev) => {
          if (
            payload.estado === "aprobado" ||
            payload.estado === "suspendido"
          ) {
            return prev.map((u) =>
              u.id === usuarioSeleccionado.id ? { ...u, ...payload } : u,
            );
          }
          return prev.filter((u) => u.id !== usuarioSeleccionado.id);
        });

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
          Modifica la información básica, reasigna roles operativos o gestiona
          las suspensiones de cuentas activas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: LISTADO */}
        <div
          className={cn(
            "lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4",
            verFormularioMovil ? "hidden lg:block" : "block",
          )}
        >
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

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
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
                        : "border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/50",
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {usr.nombre?.[0] || ""}
                      {usr.apellido?.[0] || ""}
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
              <p className="text-center py-8 text-slate-400 dark:text-slate-500">
                No se encontraron usuarios.
              </p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: TARJETA UNIFICADA */}
        <div
          className={cn(
            "lg:col-span-7",
            verFormularioMovil ? "block" : "hidden lg:block",
          )}
        >
          {usuarioSeleccionado ? (
            <form
              onSubmit={handleGuardarCambios}
              className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all"
            >
              {/* Overlay de Carga Unificado */}
              {isPending && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-20 transition-all">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-950 shadow-md border border-slate-100 dark:border-slate-800 px-4 py-2.5 rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando cambios del usuario...
                  </div>
                </div>
              )}

              {/* Cabecera Interna de la Tarjeta */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/10">
                {/* Botón Móvil */}
                <button
                  type="button"
                  onClick={() => setVerFormularioMovil(false)}
                  className="lg:hidden flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-2 rounded-xl border border-teal-100 dark:border-teal-900 mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la lista
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="h-14 w-14 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-lg font-bold flex items-center justify-center uppercase shrink-0 ring-4 ring-teal-500/5">
                    {formNombre?.[0] || ""}
                    {formApellido?.[0] || ""}
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0 space-y-0.5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize truncate">
                      {formNombre || "---"} {formApellido || "---"}
                    </h2>

                    <div className="flex flex-col text-slate-400 dark:text-slate-500 text-[11px] space-y-1">
                      <span className="flex items-center justify-center sm:justify-start gap-1 font-mono truncate">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400/80" />{" "}
                        {usuarioSeleccionado.correo}
                      </span>

                      {/* FORMATEO COMPLETO INCORPORADO AQUÍ */}
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1 flex items-center justify-center sm:justify-start gap-1">
                        <Calendar className="h-3 w-3 shrink-0 text-slate-400/80" />
                        <span>Registrado: </span>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {usuarioSeleccionado.created_at
                            ? (() => {
                                const fecha = new Date(
                                  usuarioSeleccionado.created_at,
                                );
                                if (isNaN(fecha.getTime()))
                                  return "Fecha inválida";
                                const fechaFormateada =
                                  fecha.toLocaleDateString("es-EC", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  });
                                let horas = fecha.getHours();
                                const minutos = fecha
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, "0");
                                const ampm = horas >= 12 ? "PM" : "AM";
                                horas = horas % 12 || 12;
                                return `${fechaFormateada}, ${horas}:${minutos} ${ampm}`;
                              })()
                            : "Fecha no disponible"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuerpo del Formulario */}
              <div className="p-6 space-y-6">
                {/* Sección 1: Información Personal */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Información Básica del Colaborador
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" /> Nombres
                      </label>
                      <input
                        type="text"
                        required
                        value={formNombre}
                        onChange={(e) => setFormNombre(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-800 dark:text-slate-200 font-medium focus:border-teal-500 dark:focus:border-teal-600 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" /> Apellidos
                      </label>
                      <input
                        type="text"
                        required
                        value={formApellido}
                        onChange={(e) => setFormApellido(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 transform-none dark:border-slate-800 rounded-xl h-11 px-4 text-slate-800 dark:text-slate-200 font-medium focus:border-teal-500 dark:focus:border-teal-600 outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Fingerprint className="h-3 w-3 text-slate-400" />{" "}
                        Identificación (Cédula)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={usuarioSeleccionado.cedula || "N/A"}
                        className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-400 dark:text-slate-500 font-mono cursor-default focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> Teléfono
                        Celular
                      </label>
                      <input
                        type="text"
                        value={formCelular}
                        onChange={(e) => setFormCelular(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-slate-800 dark:text-slate-200 font-medium focus:border-teal-500 dark:focus:border-teal-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Divisor Interno Suave */}
                <div className="border-t border-slate-100 dark:border-slate-800/60" />

                {/* Sección 2: Permisos y Accesos */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Estructura Operativa y Seguridad
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Rol Asignado
                      </label>
                      <select
                        value={formRolId}
                        onChange={(e) => setFormRolId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-3 font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-xs"
                      >
                        <option value="">Sin Rol Asignado</option>
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Estado de Cuenta
                      </label>
                      <select
                        value={formEstado}
                        onChange={(e) =>
                          setFormEstado(e.target.value as Usuario["estado"])
                        }
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-3 font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500 dark:focus:border-teal-600 transition-colors text-xs"
                      >
                        <option value="aprobado">🟢 Activo / Autorizado</option>
                        <option value="suspendido">
                          🔴 Suspendido / Inactivo
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Botón de Guardado */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Actualizar información del Usuario
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 font-medium shadow-sm">
              Selecciona un colaborador de la lista para gestionar sus
              credenciales corporativas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
