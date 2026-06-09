// app/protected/propietarios/page.tsx
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import DirectorioClientesClient from "../components/propietarios/DirectorioClientesClient";
import { Propietario } from "@/types/veterinaria";

export default async function DirectorioClientesPage() {
  const supabase = await createClient();

  // Traer todos los propietarios con sus respectivas mascotas ordenados por los más recientes
  const { data: propietarios, error } = await supabase
    .from("propietarios")
    .select("*, pacientes(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error al obtener el directorio:", error.message);
  }

  // Server Action por si necesitas eliminar un expediente en cascada desde esta vista
  async function handleEliminarPropietarioAction(id: string) {
    "use server";
    const supabaseServer = await createClient();
    
    const { error: deleteError } = await supabaseServer
      .from("propietarios")
      .delete()
      .eq("id", id);

    if (deleteError) throw new Error(deleteError.message);
    
    revalidatePath("/protected/propietarios");
  }

  return (
    <DirectorioClientesClient 
      propietariosIniciales={(propietarios as Propietario[]) || []} 
      onEliminarPropietario={handleEliminarPropietarioAction}
    />
  );
}