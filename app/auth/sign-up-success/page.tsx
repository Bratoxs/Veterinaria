"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

// Tipamos explícitamente para recibir únicamente className de forma opcional y segura
interface SignUpSuccessPageProps {
  className?: string;
}

export default function SignUpSuccessPage({
  className,
}: SignUpSuccessPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-[80vh] flex-col items-center justify-center p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      <Card className="max-w-md w-full border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="pt-12 px-10 pb-4 text-center flex flex-col items-center">
          {/* Icono Principal de Éxito */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-teal-50 animate-ping opacity-75" />
            <div className="relative bg-teal-50 p-4 rounded-full text-[#0d9488]">
              <CheckCircle2 className="h-12 w-12 stroke-[1.5]" />
            </div>
          </div>

          <h1 className="text-2xl text-slate-800 font-bold tracking-tight">
            ¡Registro Recibido!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tu solicitud ha sido ingresada correctamente en el sistema.
          </p>
        </CardHeader>

        <CardContent className="px-10 pb-12 pt-2 flex flex-col gap-6">
          {/* Bloque Informativo sobre la validación del Administrador */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-start">
            <div className="bg-amber-50 p-2 rounded-xl text-amber-600 shrink-0 mt-0.5">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-700">
                Validación por el Administrador
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Por motivos de seguridad y control interno, tu cuenta se
                encuentra actualmente en **estado pendiente**.
              </p>
            </div>
          </div>

          {/* Próximos pasos en formato de micro-lista */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">
              ¿Qué pasará ahora?
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5 pl-1">

              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-[10px] font-bold text-[#0d9488] dark:text-teal-400">
                  1
                </span>
                <p className="leading-normal">
                  El <strong>administrador del sistema</strong> revisará tu
                  solicitud y, de ser aprobada, te otorgará el rol
                  correspondiente y acceso al sistema.
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-[10px] font-bold text-[#0d9488] dark:text-teal-400">
                  2
                </span>
                <p className="leading-normal">
                  Se te notificará <strong>vía email</strong> una vez que tu
                  cuenta haya sido completamente activada con tus accesos.
                </p>
              </li>
            </ul>
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Acción principal */}
          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-md shadow-teal-50 transition-all active:scale-95 flex items-center justify-center gap-2"
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
