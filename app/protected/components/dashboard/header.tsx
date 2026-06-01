import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { createClient } from "@/lib/supabase/server";

// 1. Creamos un componente interno que hace la consulta pesada a Supabase
async function MobileMenuWithData() {
  let conteoPendientes = 0;

  try {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("estado", "pendiente");

    if (!error && count !== null) {
      conteoPendientes = count;
    }
  } catch (err) {
    console.error("Error al obtener pendientes en Header:", err);
  }

  // Retorna el menú móvil con los datos reales ya cargados
  return <MobileMenu cantidadPendientes={conteoPendientes} />;
}

// 2. El Header principal se queda limpio y no bloquea la navegación
export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-3">
        
        {/* 
          Envolvemos el menú en <Suspense>. 
          Mientras Supabase responde, mostrará el botón de la hamburguesa vacío (0) como fallback.
        */}
        <Suspense fallback={<MobileMenu cantidadPendientes={0} />}>
          <MobileMenuWithData />
        </Suspense>
        
        <div className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:block">
          Panel de Administración de la Clínica
        </div>
        <Link href="/protected" className="text-[#0d9488] font-bold text-sm block sm:hidden">
          🐾 VetCare
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="text-xs text-slate-400 animate-pulse">Cargando...</div>}>
          <AuthButton />
        </Suspense>
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
        <ThemeSwitcher />
      </div>
    </header>
  );
}