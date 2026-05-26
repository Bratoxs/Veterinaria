import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { ChevronDown, ShieldCheck } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  // 1. Método rápido de claims para verificar la sesión
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 2. Consulta REAL a tu tabla 'public.usuario' usando el ID del usuario
  let fullName = "Usuario";
  if (user?.sub) {
    const { data: usuario } = await supabase
      .from("usuarios") // Tu tabla public.usuario
      .select("nombre, apellido") // Traemos ambos campos
      .eq("id", user.sub)
      .single();

    if (usuario?.nombre || usuario?.apellido) {
      // Concatenamos nombre y apellido limpiando espacios de más
      fullName = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
    } else {
      // Respaldo por si la tabla no tiene datos aún
      fullName = "Invitado";
    }
  }

  return (
    /* 3. El estilo optimizado con CSS nativo (Hover seguro en el servidor) */
    <div className="relative group flex items-center gap-2">
      
      {/* Contenedor del Perfil */}
      <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer select-none">
        {/* Icono médico circular veterinario */}
        <div className="h-8 w-8 rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-sm shrink-0 text-sm">
          🩺
        </div>

        {/* Texto de Bienvenida Dinámico */}
        <div className="hidden md:flex flex-col text-xs leading-tight">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Bienvenido,</span>
          <span className="text-slate-700 dark:text-slate-200 font-semibold max-w-[140px] truncate capitalize">
            {fullName}
          </span>
        </div>

        {/* Flecha indicadora que rota al pasar el mouse */}
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:rotate-180" />
      </div>

      {/* LISTA DESPLEGABLE (Se muestra al hacer hover sobre el contenedor) */}
      <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs hidden group-hover:block transition-all">
        
        <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Mi Cuenta
        </div>

        <div className="px-4 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          <span>Rol: Administrador</span>
        </div>

        <hr className="my-1.5 border-slate-100 dark:border-slate-800" />

        {/* Tu LogoutButton original con el estilo premium que armamos */}
        <div className="px-2">
          <LogoutButton />
        </div>
      </div>

    </div>
  );
}