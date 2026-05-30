"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SignUpSuccessPageProps {
  className?: string;
}

export default function SignUpSuccessPage({
  className,
}: SignUpSuccessPageProps) {
  return (
    // Se añade este contenedor únicamente para centrar el componente en pantalla
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      
      {/* Tu Card original intacto, solo con max-w-md y w-full para el ancho */}
      <Card className={cn("max-w-md w-full shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden", className)}>
        <CardContent className="p-10 pt-4">
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col items-center mb-2">
              <div className="w-28 h-28 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-teal-100 dark:border-teal-900 shadow-sm relative">
                {/* Efecto animado adaptado dentro del círculo */}
                <div className="absolute inset-0 rounded-full bg-teal-50 dark:bg-teal-950/40 animate-ping opacity-75" />
                <CheckCircle2 className="relative h-12 w-12 text-[#0d9488] dark:text-teal-400 stroke-[1.5]" />
              </div>
              
              <h2 className="text-[#0d9488] text-xl font-bold tracking-widest uppercase">
                ¡Registro Recibido!
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                Tu solicitud ha sido ingresada correctamente en el sistema
              </p>
            </div>

            {/* Bloque Informativo: Conserva la estética de alertas con inputs grises */}
            <div className="bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 rounded-xl p-4 flex gap-4 items-start">
              <div className="bg-amber-50 dark:bg-amber-950/60 p-2 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Validación por el Administrador
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Por motivos de seguridad y control interno, tu cuenta se encuentra actualmente en <span className="font-bold text-slate-700 dark:text-slate-300">estado pendiente</span>.
                </p>
              </div>
            </div>

            {/* Listado de Próximos Pasos */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 pl-1">
                ¿Qué pasará ahora?
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-3 pl-1">
                
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 text-[10px] font-bold text-[#0d9488] dark:text-teal-400">
                    1
                  </span>
                  <p className="leading-normal text-[11px]">
                    El <strong className="text-slate-700 dark:text-slate-300">administrador del sistema</strong> revisará tu solicitud y, de ser aprobada, te otorgará el acceso.
                  </p>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 text-[10px] font-bold text-[#0d9488] dark:text-teal-400">
                    2
                  </span>
                  <p className="leading-normal text-[11px]">
                    Se te notificará <strong className="text-slate-700 dark:text-slate-300">vía email</strong> una vez que tu cuenta haya sido completamente activada.
                  </p>
                </li>

              </ul>
            </div>

            {/* Línea divisoria */}
            <hr className="border-gray-100 dark:border-slate-800/80 my-1" />

            {/* Botón Principal: Copiado milimétricamente de tu Login */}
            <Button
              asChild
              className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-teal-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Link href="/auth/login">
                Volver al Inicio de Sesión
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}