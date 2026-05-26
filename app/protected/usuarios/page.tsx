import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, UserCheck, UserX, Shield, RefreshCw, Save, AlertTriangle, Ban } from "lucide-react";
import { revalidatePath } from "next/cache";

// =========================================================================
// SERVER ACTIONS (Operaciones basadas en tu estructura estricta de Base de Datos)
// =========================================================================

async function cambiarRol(usuarioId: string, nuevoRolId: string) {
  "use server";
  const supabase = await createClient();
  
  // Si el selector manda un string vacío, lo guardamos como null
  const valorRol = nuevoRolId === "" ? null : nuevoRolId;

  await supabase
    .from("usuarios")
    .update({ rol_id: valorRol })
    .eq("id", usuarioId);
  
  revalidatePath("/protected/usuarios");
}

async function concederAcceso(usuarioId: string) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("usuarios")
    .update({ estado: "aprobado" }) // Concede acceso cambiando a 'aprobado'
    .eq("id", usuarioId);

  revalidatePath("/protected/usuarios");
}

async function revocarAcceso(usuarioId: string) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("usuarios")
    .update({ estado: "suspendido" }) // Corta el acceso cambiando a 'suspendido'
    .eq("id", usuarioId);

  revalidatePath("/protected/usuarios");
}

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

export default async function UsuariosAdminPage() {
  const supabase = await createClient();

  // 1. Identificamos al Admin logueado para excluirlo de la cuadrícula
  const { data: claimsData } = await supabase.auth.getClaims();
  const adminId = claimsData?.claims?.sub;

  // 2. Traemos a los usuarios de la BD. 
  // NOTA: Si necesitas ver los nombres de los roles en vez de los UUIDs, 
  // puedes usar .select("*, roles(nombre_rol)") si tu tabla roles tiene un campo name/nombre.
  let query = supabase
    .from("usuarios")
    .select("id, username, nombre, apellido, correo, rol_id, estado")
    .order("apellido", { ascending: true });

  if (adminId) {
    query = query.neq("id", adminId);
  }

  const { data: usuarios, error } = await query;

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl text-xs">
        Error al cargar el listado de usuarios de la base de datos: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn text-xs">
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            🛡️ Panel de Control de Usuarios
          </h1>
          <p className="text-slate-400 dark:text-slate-500 mt-1">
            Gestión estricta de accesos corporativos y asignación de roles del personal.
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Esquema: public.usuarios</span>
        </div>
      </div>

      {/* TABLA DE GESTIÓN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Usuario / Personal</th>
                <th className="px-6 py-3.5">Nombre de Usuario</th>
                <th className="px-6 py-3.5">Correo Electrónico</th>
                <th className="px-6 py-3.5 text-center">Rol Asignado (UUID)</th>
                <th className="px-6 py-3.5 text-center">Estado de Acceso</th>
                <th className="px-6 py-3.5 text-center">Acciones de Aprobación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {usuarios && usuarios.length > 0 ? (
                usuarios.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    
                    {/* Nombre y Apellido */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold uppercase">
                          {usr.nombre?.[0] || usr.apellido?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 capitalize">
                            {usr.nombre} {usr.apellido}
                          </p>
                          <span className="text-[10px] text-slate-400">ID: {usr.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">
                      @{usr.username}
                    </td>

                    {/* Correo */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono">
                      {usr.correo}
                    </td>

                    {/* Selector del Rol_ID (Aquí debes reemplazar las opciones con los UUID reales de tu tabla de roles) */}
                    <td className="px-6 py-4 text-center">
                      <form 
                        action={async (formData) => {
                          "use server";
                          const rol = formData.get("rol") as string;
                          await cambiarRol(usr.id, rol);
                        }}
                        className="flex items-center justify-center gap-1.5"
                      >
                        <select
                          name="col_rol"
                          defaultValue={usr.rol_id || ""}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-teal-500 transition-colors text-xs"
                        >
                          <option value="">⚠️ Sin Rol Asignado</option>
                          {/* Reemplaza estos values con los UUIDs reales de tu tabla de roles de la BD */}
                          <option value="ID_DE_TU_ROL_VETERINARIO">👨‍⚕️ Veterinario</option>
                          <option value="ID_DE_TU_ROL_ADMINISTRADOR">👑 Administrador</option>
                          <option value="ID_DE_TU_ROL_RECEPCIONISTA">📋 Recepcionista</option>
                        </select>
                        
                        <button
                          type="submit"
                          title="Guardar Rol"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </td>

                    {/* Estado de Acceso Fiel a los 4 estados de tu CHECK */}
                    <td className="px-6 py-4 text-center">
                      {usr.estado === "aprobado" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] capitalize">
                          <ShieldCheck className="h-3.5 w-3.5" /> {usr.estado}
                        </span>
                      )}
                      {usr.estado === "pendiente" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold text-[10px] capitalize">
                          <Shield className="h-3.5 w-3.5" /> {usr.estado}
                        </span>
                      )}
                      {usr.estado === "rechazado" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold text-[10px] capitalize">
                          <AlertTriangle className="h-3.5 w-3.5" /> {usr.estado}
                        </span>
                      )}
                      {usr.estado === "suspendido" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-[10px] capitalize">
                          <Ban className="h-3.5 w-3.5" /> {usr.estado}
                        </span>
                      )}
                    </td>

                    {/* Dos Botones de Control de Estado */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón: Conceder Acceso */}
                        <form action={concederAcceso.bind(null, usr.id)}>
                          <button
                            type="submit"
                            disabled={usr.estado === "aprobado"}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold border shadow-sm transition-all text-[11px] ${
                              usr.estado === "aprobado"
                                ? "bg-slate-50 text-slate-300 border-slate-100 dark:bg-slate-800/40 dark:text-slate-700 dark:border-slate-800/50 cursor-not-allowed shadow-none"
                                : "bg-white hover:bg-teal-50 text-teal-600 border-teal-200 dark:bg-slate-900 dark:hover:bg-teal-950/20 dark:border-teal-900/40"
                            }`}
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Conceder
                          </button>
                        </form>

                        {/* Botón: Revocar Acceso */}
                        <form action={revocarAcceso.bind(null, usr.id)}>
                          <button
                            type="submit"
                            disabled={usr.estado === "suspendido"}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold border shadow-sm transition-all text-[11px] ${
                              usr.estado === "suspendido"
                                ? "bg-slate-50 text-slate-300 border-slate-100 dark:bg-slate-800/40 dark:text-slate-700 dark:border-slate-800/50 cursor-not-allowed shadow-none"
                                : "bg-white hover:bg-red-50 text-red-600 border-red-200 dark:bg-slate-900 dark:hover:bg-red-950/20 dark:border-red-900/40"
                            }`}
                          >
                            <UserX className="h-3.5 w-3.5" /> Revocar
                          </button>
                        </form>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                    No hay otros usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}