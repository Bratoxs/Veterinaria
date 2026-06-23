// app/protected/propietarios/loading.tsx
import { FolderHeart, Search, Info } from "lucide-react";

export default function LoadingPropietarios() {
  // Creamos un array de 4 elementos para simular 4 tarjetas cargando
  const skeletons = Array.from({ length: 4 });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 min-h-screen pb-20 text-xs font-sans text-slate-400 select-none">
      
      {/* Cabecera Espejo (Idéntica a la real pero estática) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-300 dark:text-slate-700 flex items-center gap-2">
            <FolderHeart className="h-6 w-6 text-slate-200 dark:text-slate-800" />
            Expedientes Clínicos
          </h1>
          <p className="text-slate-400/60 text-xs">
            Base de datos integral: Consulta, busca e ingresa fichas clínicas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto opacity-50 pointer-events-none">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="w-full sm:w-auto h-10 px-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* LISTADO DE SKELETONS PULSANTES */}
      <div className="space-y-3">
        {skeletons.map((_, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between animate-pulse shadow-sm"
          >
            {/* Bloque Izquierdo: Inicial + Textos */}
            <div className="flex items-center gap-4 w-2/3">
              {/* Avatar circular/cuadrado del Propietario */}
              <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              
              {/* Líneas de texto simuladas */}
              <div className="space-y-2 w-full">
                {/* Nombre del dueño */}
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 sm:w-1/2" />
                
                {/* Cédula y contador de mascotas */}
                <div className="flex items-center gap-2">
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                </div>
              </div>
            </div>

            {/* Bloque Derecho: Iconos de acción */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Pie inferior estático */}
      <div className="flex items-center gap-2 justify-center text-slate-300 dark:text-slate-700 opacity-60">
        <Info className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium">Los cambios y eliminaciones se sincronizan en cascada de forma segura mediante Supabase.</span>
      </div>

    </div>
  );
}