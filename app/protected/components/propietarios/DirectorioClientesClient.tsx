// app/protected/propietarios/DirectorioClientesClient.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  FolderHeart, Search, Phone, Mail, MapPin, Fingerprint, 
  ChevronDown, ChevronUp, PawPrint, Calendar, Trash2, ShieldCheck, Info, FilePlus2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Propietario } from "@/types/veterinaria";

interface Props {
  propietariosIniciales: Propietario[];
  onEliminarPropietario: (id: string) => Promise<void>;
}

export default function DirectorioClientesClient({ propietariosIniciales, onEliminarPropietario }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [expedienteAbierto, setExpedienteAbierto] = useState<string | null>(null);

  // Filtrado en tiempo real por Nombre o Cédula
  const propietariosFiltrados = propietariosIniciales.filter(p => 
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cedula.includes(busqueda)
  );

  const toggleExpediente = (id: string) => {
    setExpedienteAbierto(expedienteAbierto === id ? null : id);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el expediente de ${nombre}? Esto borrará también a todas sus mascotas asociadas.`)) return;

    startTransition(async () => {
      try {
        await onEliminarPropietario(id);
        toast.success("Expediente eliminado del sistema.");
      } catch (error) {
        console.error("Error al eliminar el expediente:", error);
        toast.error("No se pudo eliminar el registro.");
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 min-h-screen pb-20 text-xs font-sans text-slate-700 dark:text-slate-300 relative">
      
      {/* Indicador de carga sutil en mutaciones */}
      {isPending && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white dark:bg-teal-600 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-bold z-50 animate-bounce">
          Actualizando expedientes...
        </div>
      )}

      {/* Cabecera unificada con Buscador y Acción de Entrada */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderHeart className="h-6 w-6 text-teal-600" />
            Expedientes Clínicos
          </h1>
          <p className="text-slate-500 text-xs">
            Base de datos integral: Consulta, busca e ingresa fichas clínicas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          {/* Buscador inteligente */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por dueño o cédula..." 
              className="w-full pl-10 pr-3 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-teal-500 shadow-sm text-xs transition-all"
            />
          </div>

          {/* Botón Maestro: Redirecciona al Formulario en Dos Pasos */}
          <button
            type="button"
            onClick={() => router.push("/protected/pacientes")}
            className="w-full sm:w-auto h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 transition-all text-xs active:scale-95 shrink-0"
          >
            <FilePlus2 className="h-4 w-4" />
            Nueva Admisión
          </button>
        </div>
      </div>

      {/* LISTADO DE EXPEDIENTES COLAXABLES */}
      <div className="space-y-3">
        {propietariosFiltrados.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
            No se encontraron expedientes que coincidan con la búsqueda.
          </div>
        ) : (
          propietariosFiltrados.map((propietario) => {
            const isOpen = expedienteAbierto === propietario.id;
            const totalMascotas = propietario.pacientes?.length || 0;

            return (
              <div 
                key={propietario.id}
                className={cn(
                  "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm",
                  isOpen && "ring-1 ring-teal-500/30 shadow-md"
                )}
              >
                {/* ACORDEÓN HEADER */}
                <div 
                  onClick={() => toggleExpediente(propietario.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-sm shadow-inner">
                      {propietario.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{propietario.nombre_completo}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[10px] font-medium">
                        <span className="flex items-center gap-0.5"><Fingerprint className="h-3 w-3" /> {propietario.cedula}</span>
                        <span>•</span>
                        <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 px-1.5 py-0.5 rounded font-bold">
                          {totalMascotas} {totalMascotas === 1 ? "Mascota" : "Mascotas"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      onClick={() => handleEliminar(propietario.id, propietario.nombre_completo)}
                      className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Eliminar Expediente"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleExpediente(propietario.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* ACORDEÓN BODY */}
                {isOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                    
                    {/* Datos del Responsable */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-950 border rounded-xl p-3.5 shadow-inner">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Teléfono</p>
                          <p className="font-semibold">{propietario.telefono || "No registrado"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Correo</p>
                          <p className="font-semibold truncate max-w-[200px]">{propietario.correo || "No registrado"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Dirección</p>
                          <p className="font-semibold">{propietario.direccion || "No registrado"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pacientes Vinculados */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        <PawPrint className="h-3.5 w-3.5 text-teal-600" /> Pacientes Registrados
                      </div>
                      
                      {totalMascotas === 0 ? (
                        <p className="text-[11px] text-slate-400 italic pl-5">Este expediente no cuenta con mascotas vinculadas.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-1">
                          {propietario.pacientes?.map((mascota) => {
                            const emoji = mascota.especie === "Perro" ? "🐶" : mascota.especie === "Gato" ? "🐱" : mascota.especie === "Ave" ? "🦜" : "🐹";
                            return (
                              <div 
                                key={mascota.id} 
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="text-lg p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg border">{emoji}</div>
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{mascota.nombre}</p>
                                    <p className="text-[10px] text-slate-400 font-medium capitalize">
                                      {mascota.raza || "Sin Raza"} {mascota.color ? `(${mascota.color})` : ""} • {mascota.genero}
                                    </p>
                                    {mascota.peso_kg && (
                                      <p className="text-[9px] text-slate-500 font-semibold mt-0.5">⚖️ {Number(mascota.peso_kg)} Kg</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  {mascota.esterilizado && (
                                    <span className="bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 font-bold px-1.5 py-0.5 rounded text-[8px] flex items-center gap-0.5">
                                      <ShieldCheck className="h-2.5 w-2.5" /> Castrado
                                    </span>
                                  )}
                                  {mascota.fecha_nacimiento && (
                                    <span className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5">
                                      <Calendar className="h-2.5 w-2.5" /> {mascota.fecha_nacimiento.toString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pie informativo */}
      <div className="flex items-center gap-2 justify-center text-slate-400">
        <Info className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium">Los cambios y eliminaciones se sincronizan en cascada de forma segura mediante Supabase.</span>
      </div>
    </div>
  );
}