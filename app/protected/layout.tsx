import { Suspense } from "react"; // 💡 Importamos Suspense
import { Sidebar } from "./components/dashboard/sidebar";
import { Header } from "./components/dashboard/header";
import { Footer } from "./components/dashboard/footer";
import { createClient } from "@/lib/supabase/server";
import { Toaster } from "sonner";

// 📦 1. Creamos un contenedor asíncrono exclusivo para el Sidebar
async function SidebarConDatos() {
  const supabase = await createClient();

  const { count } = await supabase
    .from("usuarios")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente");

  return <Sidebar cantidadPendientes={count || 0} />;
}

// El Layout principal vuelve a ser síncrono y ultra rápido, sin bloquear la navegación
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      
      {/* Envolvemos el componente dinámico en Suspense */}
      {/* Mientras Supabase responde, se renderiza un Sidebar genérico con 0 pendientes */}
      <Suspense fallback={<Sidebar cantidadPendientes={0} />}>
        <SidebarConDatos />
      </Suspense>

      {/* 2. Área de trabajo derecha */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        
        {/* Barra superior */}
        <Header />

        {/* Contenedor del contenido principal e información dinámica */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
          <div className="min-h-full flex flex-col justify-between p-4 md:p-6 gap-8">
            
            <div className="flex-1 w-full">
              {children}
              <Toaster position="top-right" richColors />
            </div>

            {/* Pie de página */}
            <Footer />

          </div>
        </main>

      </div>
    </div>
  );
}