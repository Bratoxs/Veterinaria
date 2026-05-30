
import { createClient } from "@/lib/supabase/server"; // Ajusta la ruta a tu cliente de Supabase
import { revalidatePath } from "next/cache";
import UsuariosAdminClient from "./UsuariosAdminClient"; // Componente cliente que crearemos para manejar la UI

export default async function Page() {
  const supabase = await createClient();

  // 🔍 AQUÍ SE HACE LA CONSULTA DIRECTA A TU TABLA
  const { data: usuarios, error } = await supabase
    .from("usuarios")
    .select("id, cedula, username, nombre, apellido, correo, celular, rol_id, estado, created_at")
    .eq("estado", "pendiente") // Trae solo las solicitudes que están pendientes
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener usuarios de Supabase:", error.message);
  }

  // 🛠️ Server Action: Guarda el rol seleccionado en la base de datos
  const cambiarRol = async (id: string, rolId: string) => {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer
      .from("usuarios")
      .update({ rol_id: rolId })
      .eq("id", id);
  };

  // 🛠️ Server Action: Aprueba al usuario cambiando su estado
  const concederAcceso = async (id: string) => {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer
      .from("usuarios")
      .update({ estado: "aprobado" })
      .eq("id", id);
    
    // 🔄 Recarga los datos en el servidor para que el usuario aprobado desaparezca de la lista
    revalidatePath("/admin/usuarios"); 
  };

  // 🛠️ Server Action: Rechaza la solicitud
  const rechazarAcceso = async (id: string) => {
    "use server";
    const supabaseServer = await createClient();
    await supabaseServer
      .from("usuarios")
      .update({ estado: "rechazado" })
      .eq("id", id);

    revalidatePath("/admin/usuarios");
  };

  return (
    <UsuariosAdminClient 
      usuariosIniciales={usuarios ?? []} 
      onCambiarRol={cambiarRol}
      onConcederAcceso={concederAcceso}
      onRechazarAcceso={rechazarAcceso}
    />
  );
}