import UsuariosAdminClient from "../components/usuarios/UsuariosAdminClient";
import { createClient } from "@/lib/supabase/server";
// Importas tus acciones desde donde las tengas guardadas:
import { handleCambiarRol, handleConcederAcceso, handleRechazarAcceso } from "../components/usuarios/actions"; 

export default async function UsuariosAdminPage() {
  const supabase = await createClient();

  // 1. Traemos los usuarios iniciales
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <UsuariosAdminClient
      usuariosIniciales={usuarios || []}
      onCambiarRol={handleCambiarRol}
      onConcederAcceso={handleConcederAcceso}
      onRechazarAcceso={handleRechazarAcceso}
    />
  );
}