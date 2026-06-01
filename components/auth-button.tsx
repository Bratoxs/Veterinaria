import { createClient } from "@/lib/supabase/server";
import { UserMenuClient } from "./user-menu-client";

export async function AuthButton() {
  const supabase = await createClient();

  // 1. Método rápido de claims para verificar la sesión
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 2. Consulta REAL a tu tabla 'usuarios'
  let fullName = "Usuario";
  if (user?.sub) {
    const { data: usuario } = await supabase
      .from("usuarios") 
      .select("nombre, apellido") 
      .eq("id", user.sub)
      .single();

    if (usuario?.nombre || usuario?.apellido) {
      fullName = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
    } else {
      fullName = "Invitado";
    }
  }

  // Le pasamos el nombre al componente cliente que manejará los clics e interactividad
  return <UserMenuClient fullName={fullName} />;
}