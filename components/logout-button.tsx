"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react"; // Importamos el icono para el botón

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Buenas prácticas: Refrescamos los componentes del servidor antes de redirigir 
    // para limpiar cualquier estado de sesión viejo en la interfaz.
    router.refresh(); 
    router.push("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold text-left text-xs outline-none select-none rounded-xl"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Cerrar sesión
    </button>
  );
}