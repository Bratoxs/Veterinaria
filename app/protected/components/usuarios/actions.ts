"use server";

import { createClient } from "@/lib/supabase/server"; // Ajusta esta ruta a tu proyecto
import { revalidatePath } from "next/cache";

export async function handleConcederAcceso(id: string) {
  const supabaseServer = await createClient();
  await supabaseServer
    .from("usuarios")
    .update({ estado: "aprobado" })
    .eq("id", id);

  revalidatePath("/protected", "layout"); 
}

export async function handleRechazarAcceso(id: string) {
  try {
    const supabaseServer = await createClient();
    
    const { error } = await supabaseServer
      .from("usuarios")
      .update({ estado: "rechazado" })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
    
    revalidatePath("/protected", "layout");
    
    return "El usuario ha sido rechazado correctamente.";

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    throw new Error(errorMessage);
  }
}

export async function handleCambiarRol(id: string, rolId: string) {
  console.log("🔄 Cambiando rol para ID:", id, "al rol:", rolId);
  // const supabaseServer = await createClient();
  // await supabaseServer
  //   .from("usuarios")
  //   .update({ rol_id: rolId })
  //   .eq("id", id);
    
  // // Opcional: si necesitas que el cambio de rol refresque interfaces instantáneamente
  // revalidatePath("/protected", "layout");
}