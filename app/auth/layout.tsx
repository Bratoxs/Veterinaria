import { ThemeSwitcher } from "@/components/theme-switcher";
import { Toaster } from "sonner"; // 👈 Ya lo tenías importado, ¡excelente!

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    // min-h-screen y flex-col aseguran que el contenedor ocupe toda la pantalla
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 relative">
      
      {/* Selector de tema flotante arriba a la derecha */}
      <div className="absolute top-4 right-4 z-50 md:top-6 md:right-6">
        <ThemeSwitcher />
      </div>

      {/* Contenedor central para los formularios (Login, Registro, etc.) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 w-full max-w-5xl mx-auto">
        <div className="w-full">
          {children}
        </div>
      </div>

      {/* Pie de página exclusivo para el flujo de autenticación */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-transparent py-6 shrink-0">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          <p>
            &copy; 2026 BratoxsTech. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* 🚀 EL INYECTOR GLOBAL DE NOTIFICACIONES CORREGIDO AQUÍ: */}
      <Toaster closeButton position="top-right" richColors />

    </main>
  );
}