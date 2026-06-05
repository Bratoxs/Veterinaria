import { createClient } from "@/lib/supabase/server";
import UsuariosEditClient from "../components/usuarios/UsuariosEditClient";

export default async function UsuariosPage() {
  const supabase = await createClient();

  // Obtener administrador logueado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminId = user?.id;

  // 1. Obtener usuarios que SOLO estén aprobados o suspendidos (excluye al admin logueado)
  const query = supabase
    .from("usuarios")
    .select("*")
    .in("estado", ["aprobado", "suspendido"]);

  if (adminId) {
    query.not("id", "eq", adminId);
  }

  const { data: usuarios, error: errorUsuarios } = await query.order(
    "apellido",
    { ascending: true },
  );

  // 2. Obtener roles disponibles menos el Administrador
  const { data: roles, error: errorRoles } = await supabase
    .from("roles")
    .select("id, nombre")
    .neq("nombre", "Administrador")
    .order("nombre", { ascending: true });

  if (errorUsuarios || errorRoles) {
    console.error("❌ Error cargando datos de usuarios activos:", {
      errorUsuarios,
      errorRoles,
    });
  }

  // Definimos un tipo específico para los campos editables
  type UsuarioUpdateInput = {
    nombre: string;
    apellido: string;
    celular: string;
    rol_id: string | null;
    estado: "pendiente" | "aprobado" | "rechazado" | "suspendido";
  };

  // ... dentro de tu Server Component:
  const handleActualizarUsuario = async (
    id: string,
    dataActualizada: UsuarioUpdateInput,
  ) => {
    "use server";
    const supabaseServer = await createClient();
    const { error } = await supabaseServer
      .from("usuarios")
      .update(dataActualizada)
      .eq("id", id);

    if (error) throw new Error(error.message);
    return "Usuario actualizado correctamente";
  };

  return (
    <UsuariosEditClient
      usuariosIniciales={usuarios || []}
      roles={roles || []}
      onActualizarUsuario={handleActualizarUsuario}
    />
  );
}
