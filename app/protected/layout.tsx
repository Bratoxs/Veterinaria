import { Sidebar } from "./components/dashboard/sidebar";
import { Header } from "./components/dashboard/header";
import { Footer } from "./components/dashboard/footer";


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      
      {/* 1. Menú de navegación izquierdo */}
      <Sidebar />

      {/* 2. Área de trabajo derecha */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        
        {/* Barra superior */}
        <Header />

        {/* Contenedor del contenido principal e información dinámica */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
          <div className="min-h-full flex flex-col justify-between p-4 md:p-6 gap-8">
            
            <div className="flex-1 w-full">
              {children}
            </div>

            {/* Pie de página */}
            <Footer />

          </div>
        </main>

      </div>
    </div>
  );
}