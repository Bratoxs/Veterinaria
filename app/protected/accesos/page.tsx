import UsuariosAdminClient from "../components/accesos/UsuariosAdminClient";
import { createClient } from "@/lib/supabase/server";
// Importas tus acciones desde donde las tengas guardadas:
import { handleConcederAcceso, handleRechazarAcceso } from "../components/accesos/actions"; 

export default async function UsuariosAdminPage() {
  const supabase = await createClient();

  // 1. Traemos los usuarios iniciales
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: roles, error: errorRoles } = await supabase
    .from("roles")
    .select("id, nombre")
    .neq("nombre", "Administrador") // Excluimos el rol de Administrador para que no se pueda asignar desde aquí
    .order("nombre", { ascending: true });

  if (errorRoles) {
    console.error("❌ Error al cargar los roles en el servidor:", errorRoles.message);
  }

  return (
    <UsuariosAdminClient
      usuarios={usuarios || []}
      roles={roles || []}
      onConcederAcceso={handleConcederAcceso}
      onRechazarAcceso={handleRechazarAcceso}
    />
  );
}