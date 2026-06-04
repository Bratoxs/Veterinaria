"use server";

import { ApprovalEmail } from "@/components/emails/ApprovalEmail";
import { RejectionEmail } from "@/components/emails/RejectionEmail";
import { createClient } from "@/lib/supabase/server"; // Ajusta esta ruta a tu proyecto
import { revalidatePath } from "next/cache";
import React from "react";
import { Resend } from "resend";

// Inicializamos Resend (llave en el archivo .env.local)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function handleConcederAcceso(id: string, rolId: string) {
  try {
    const supabaseServer = await createClient();

    // Obtener el nombre y correo del usuario antes de modificarlo
    const { data: usuario, error: errorBusqueda } = await supabaseServer
      .from("usuarios")
      .select("nombre, correo")
      .eq("id", id)
      .single();

    if (errorBusqueda || !usuario) {
      throw new Error("No se pudieron obtener los datos del usuario para enviar la notificación.");
    }
    
    // Actualizar el rol y cambiar el estado a "aprobado" en la base de datos
    const { error: errorUpdate } = await supabaseServer
      .from("usuarios")
      .update({ 
        rol_id: rolId, 
        estado: "aprobado" 
      })
      .eq("id", id);

    if (errorUpdate) {
      throw new Error(errorUpdate.message);
    }

    // Obtener el link dinámico desde tu variable de entorno
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 4. Enviar el correo de aprobación (usando React.createElement)
    const { error: errorEmail } = await resend.emails.send({
      from: "onboarding@resend.dev", // En producción configuras tu propio dominio
      // to: [usuario.correo], // Descomentar en producción
      to: 'marbra96@hotmail.com',
      subject: "¡Bienvenido a VetCare! - Acceso Concedido",
      react: React.createElement(ApprovalEmail, { 
        nombreUsuario: usuario.nombre || "Usuario",
        emailUsuario: usuario.correo,
        loginUrl: siteUrl
      }),
    });

    if (errorEmail) {
      console.error("❌ Error al enviar correo de aprobación:", errorEmail.message);
    }
    
    // 5. Revalidar la ruta
    revalidatePath("/protected", "layout");
    
    return "El acceso ha sido concedido correctamente y se ha enviado la notificación.";

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    throw new Error(errorMessage);
  }
}

export async function handleRechazarAcceso(id: string) {
  try {
    const supabaseServer = await createClient();

    // Obtener el nombre y correo del usuario antes de modificarlo
    const { data: usuario, error: errorBusqueda } = await supabaseServer
      .from("usuarios")
      .select("nombre, correo")
      .eq("id", id)
      .single();

    if (errorBusqueda || !usuario) {
      throw new Error("No se pudieron obtener los datos del usuario para enviar la notificación.");
    }
    
    // Actualizar el estado en la base de datos
    const { error: errorUpdate } = await supabaseServer
      .from("usuarios")
      .update({ estado: "rechazado" })
      .eq("id", id);

    if (errorUpdate) {
      throw new Error(errorUpdate.message);
    }

    // Enviar el correo, en desarrollo, 'to' debe ser el mismo correo con el que te registraste en Resend.
    const { error: errorEmail } = await resend.emails.send({
      from: "onboarding@resend.dev", // En producción configuras tu propio dominio
      // to: [usuario.correo],
      to: 'marbra96@hotmail.com',
      subject: "Actualización sobre su solicitud de acceso a VetCare",
      react: React.createElement(RejectionEmail, { nombreUsuario: usuario.nombre || "Usuario" }),
    });

    if (errorEmail) {
      console.error("❌ Error al enviar correo de rechazo:", errorEmail.message);
    }
    
    revalidatePath("/protected", "layout");
    
    return "El usuario ha sido rechazado correctamente y se ha enviado la notificación.";

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