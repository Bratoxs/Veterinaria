// app/protected/pacientes/GestionPacientesClient.tsx
"use client";

import { useState, useTransition } from "react";
import { 
  PawPrint, User, Plus, Save, HeartPulse, 
  ChevronRight, Phone, Fingerprint, MapPin, Mail, Info, Loader2, ShieldCheck, CheckCircle2, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Propietario, Paciente } from "@/types/veterinaria";

interface Props {
  onProcesarPropietario: (datos: Partial<Propietario>) => Promise<Propietario>;
  onGuardarPaciente: (datos: Partial<Paciente>) => Promise<Paciente>;
}

export default function GestionPacientesClient({ onProcesarPropietario, onGuardarPaciente }: Props) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1); // 1: Datos Dueño, 2: Mascotas
  const [mostrandoFormMascota, setMostrandoFormMascota] = useState(false);

  // --- Estado del Propietario Identificado/Creado en Base de Datos ---
  const [propietarioDb, setPropietarioDb] = useState<Propietario | null>(null);

  // --- Estados de los Inputs del Propietario (Exacto a tu Tabla) ---
  const [cedula, setCedula] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");

  // --- Estados de los Inputs de la Mascota (Exacto a tu Tabla) ---
  const [pNombre, setPNombre] = useState("");
  const [pEspecie, setPEspecie] = useState<Paciente["especie"]>("Perro");
  const [pRaza, setPRaza] = useState("");
  const [pColor, setPColor] = useState("");
  const [pPesoKg, setPPesoKg] = useState("");
  const [pFechaNacimiento, setPFechaNacimiento] = useState("");
  const [pGenero, setPGenero] = useState<Paciente["genero"]>("Macho");
  const [pEsterilizado, setPEsterilizado] = useState(false);

  // Acción al dar clic en "Siguiente" (Paso 1)
  const handleSiguientePaso = () => {
    if (!cedula) {
      toast.error("La cédula es obligatoria.");
      return;
    } else if(!nombreCompleto) {
      toast.error("El nombre completo es obligatorio.");
      return;
    } else if(!telefono) {
      toast.error("El teléfono celular es obligatorio.");
      return;
    }   else if(!correo) {
      toast.error("El correo electrónico es obligatorio.");
      return;
    }

    startTransition(async () => {
      try {
        const duenoProcesado = await onProcesarPropietario({
          cedula,
          nombre_completo: nombreCompleto,
          telefono: telefono || null,
          correo: correo || null,
          direccion: direccion || null
        });

        setPropietarioDb(duenoProcesado);
        
        // Sincronizamos por si trajo datos preexistentes de Supabase
        setTelefono(duenoProcesado.telefono || "");
        setCorreo(duenoProcesado.correo || "");
        setDireccion(duenoProcesado.direccion || "");

        toast.success(duenoProcesado.pacientes && duenoProcesado.pacientes.length > 0 
          ? "Cliente encontrado en el sistema." 
          : "Nuevo propietario registrado exitosamente."
        );
        
        setStep(2);
      } catch (error) {
        console.error("Error en handleSiguientePaso:", error);
        toast.error("Error al procesar el propietario en el servidor.");
      }
    });
  };

  // Acción al agregar una mascota (Paso 2)
  const handleAgregarMascota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propietarioDb) return;
    if (!pNombre) {
      toast.error("El nombre de la mascota es obligatorio.");
      return;
    }

    startTransition(async () => {
      try {
        const nuevaMascota = await onGuardarPaciente({
          nombre: pNombre,
          especie: pEspecie,
          raza: pRaza || null,
          color: pColor || null,
          peso_kg: pPesoKg ? Number(pPesoKg) : null,
          fecha_nacimiento: pFechaNacimiento || null,
          genero: pGenero,
          esterilizado: pEsterilizado,
          propietario_id: propietarioDb.id
        });

        setPropietarioDb(prev => {
          if (!prev) return null;
          return {
            ...prev,
            pacientes: [nuevaMascota, ...(prev.pacientes || [])]
          };
        });

        toast.success(`¡${pNombre} agregado al expediente!`);
        
        // Limpiar inputs del formulario de mascota
        setPNombre(""); setPRaza(""); setPColor(""); setPPesoKg(""); setPFechaNacimiento(""); setPGenero("Macho"); setPEsterilizado(false);
        setMostrandoFormMascota(false);
      } catch (error) {
        console.error("Error en handleAgregarMascota:", error);
        toast.error("No se pudo registrar la mascota.");
      }
    });
  };

  const handleFinalizarProceso = () => {
    toast.success("Ingreso clínico completado con éxito.");
    setStep(1);
    setPropietarioDb(null);
    setCedula(""); setNombreCompleto(""); setTelefono(""); setCorreo(""); setDireccion("");
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 min-h-screen pb-20 text-xs font-sans text-slate-700 dark:text-slate-300">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-teal-600" />
          Gestión e Ingreso de Pacientes
        </h1>
        <p className="text-slate-500 text-xs">
          Flujo dinámico y unificado de admisión veterinaria.
        </p>
      </div>

      {/* TARJETA UNIFICADA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden relative">
        
        {/* Spinner de Carga Global */}
        {isPending && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="flex items-center gap-2 font-bold text-teal-600 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
              <Loader2 className="h-4 w-4 animate-spin" /> Conectando con Supabase...
            </div>
          </div>
        )}

        {/* PASO 1: DATOS DEL PROPIETARIO */}
        <div className={cn("p-6 space-y-5 transition-all", step === 2 && "bg-slate-50/50 dark:bg-slate-950/20 opacity-50 pointer-events-none")}>
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className={cn("h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs", step === 1 ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600")}>1</div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Información del Responsable (Propietario)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Número de Cédula <span className="text-red-500">*</span></label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" required value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ej. 1726354120" className="w-full pl-10 pr-3 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-teal-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Nombre y Apellido <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" required value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} placeholder="Ej. Carlos Mendoza" className="w-full pl-10 pr-3 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-teal-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Teléfono Celular <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" required  value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 0998887766" className="w-full pl-10 pr-3 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-teal-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Correo Electrónico <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="cliente@correo.com" className="w-full pl-10 pr-3 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-teal-500" />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-500">Dirección Domiciliaria</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej. Av. Amazonas y Villalengua" className="w-full pl-10 pr-3 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:border-teal-500" />
              </div>
            </div>
          </div>

          {step === 1 && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSiguientePaso} className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-bold h-11 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95">
                Siguiente: Agregar Mascotas <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* PASO 2: CONTROL DE MASCOTAS */}
        {step === 2 && propietarioDb && (
          <div className="p-6 space-y-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-3 duration-300">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-teal-500/20">2</div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Pacientes de {propietarioDb.nombre_completo}</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Asociación directa mediante clave foránea.</p>
                </div>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold text-teal-600 uppercase hover:underline">Modificar Dueño</button>
            </div>

            {/* Grid de Mascotas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {propietarioDb.pacientes && propietarioDb.pacientes.map((m) => {
                const icon = m.especie === "Perro" ? "🐶" : m.especie === "Gato" ? "🐱" : m.especie === "Ave" ? "🦜" : m.especie === "Exótico" ? "🐹" : "🐾";
                return (
                  <div key={m.id} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xl p-1.5 bg-white dark:bg-slate-900 border rounded-xl shadow-sm">{icon}</div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs capitalize">{m.nombre}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{m.raza || "Sin Raza"} {m.color ? `(${m.color})` : ""} • {m.genero || "No especificado"}</p>
                        {m.peso_kg && <p className="text-[9px] text-slate-500 font-semibold mt-0.5">秤 {m.peso_kg} Kg</p>}
                      </div>
                    </div>
                    {m.esterilizado && <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-bold px-2 py-0.5 rounded text-[9px] flex items-center gap-0.5"><ShieldCheck className="h-3 w-3" /> Estéril</span>}
                  </div>
                );
              })}

              {/* Botón de Agregar Mascota */}
              {!mostrandoFormMascota && (
                <button type="button" onClick={() => setMostrandoFormMascota(true)} className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-950/10 transition-all flex items-center justify-center gap-2 group">
                  <Plus className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
                  <span className="font-bold text-slate-400 group-hover:text-teal-600 text-xs">Vincular Nueva Mascota</span>
                </button>
              )}
            </div>

            {/* FORMULARIO ADICIONAL COMPLETO DE LA MASCOTA */}
            {mostrandoFormMascota && (
              <form onSubmit={handleAgregarMascota} className="bg-slate-50 dark:bg-slate-950 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 animate-in zoom-in-95 duration-150">
                <div className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1"><HeartPulse className="h-4 w-4" /> Registrar Ficha del Paciente</div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Nombre Mascota *</label>
                    <input type="text" required value={pNombre} onChange={(e) => setPNombre(e.target.value)} placeholder="Ej. Rocko" className="w-full h-9 px-2.5 bg-white dark:bg-slate-900 border rounded-xl outline-none" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Especie *</label>
                    <select value={pEspecie} onChange={(e) => setPEspecie(e.target.value as Paciente["especie"])} className="w-full h-9 px-2 bg-white dark:bg-slate-900 border rounded-xl outline-none text-[11px] font-semibold">
                      <option value="Perro">🐶 Perro</option>
                      <option value="Gato">🐱 Gato</option>
                      <option value="Ave">🦜 Ave</option>
                      <option value="Exótico">🐹 Exótico</option>
                      <option value="Otro">🐾 Otro</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Raza</label>
                    <input type="text" value={pRaza} onChange={(e) => setPRaza(e.target.value)} placeholder="Ej. Schnauzer" className="w-full h-9 px-2.5 bg-white dark:bg-slate-900 border rounded-xl outline-none" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Color</label>
                    <input type="text" value={pColor} onChange={(e) => setPColor(e.target.value)} placeholder="Ej. Gris/Plata" className="w-full h-9 px-2.5 bg-white dark:bg-slate-900 border rounded-xl outline-none" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Peso (Kg)</label>
                    <input type="number" step="0.01" value={pPesoKg} onChange={(e) => setPPesoKg(e.target.value)} placeholder="0.00" className="w-full h-9 px-2.5 bg-white dark:bg-slate-900 border rounded-xl outline-none" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 flex items-center gap-0.5"><Calendar className="h-3 w-3" /> F. Nacimiento</label>
                    <input type="date" value={pFechaNacimiento} onChange={(e) => setPFechaNacimiento(e.target.value)} className="w-full h-9 px-2 bg-white dark:bg-slate-900 border rounded-xl outline-none text-[11px]" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">Género</label>
                    <select value={pGenero || "Macho"} onChange={(e) => setPGenero(e.target.value as Paciente["genero"])} className="w-full h-9 px-2 bg-white dark:bg-slate-900 border rounded-xl outline-none text-[11px] font-semibold">
                      <option value="Macho">♂️ Macho</option>
                      <option value="Hembra">♀️ Hembra</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2 pl-2 pt-4 select-none cursor-pointer">
                    <input type="checkbox" id="est" checked={pEsterilizado} onChange={(e) => setPEsterilizado(e.target.checked)} className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                    <label htmlFor="est" className="font-bold text-slate-500 cursor-pointer">¿Esterilizado?</label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setMostrandoFormMascota(false)} className="h-9 text-xs font-semibold">Cancelar</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-sm text-xs">
                    <Save className="h-3.5 w-3.5" /> Guardar Paciente
                  </Button>
                </div>
              </form>
            )}

            {/* Acción de Cierre de Admisión */}
            {propietarioDb.pacientes && propietarioDb.pacientes.length > 0 && !mostrandoFormMascota && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-center">
                <Button type="button" onClick={handleFinalizarProceso} className="w-full sm:w-64 h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <CheckCircle2 className="h-4 w-4" /> Finalizar Todo el Ingreso
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 justify-center text-slate-400">
        <Info className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium">El flujo respeta las restricciones de integridad y enumeradores CHECK de Postgres.</span>
      </div>
    </div>
  );
}