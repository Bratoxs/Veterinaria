"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Limpia el input y errores al ingresar o montar la vista
  useEffect(() => {
    setEmail("");
    setError(null);
    setSuccess(false);
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🚀 VALIDACIÓN PREMIUM CON TOAST: Verifica que no envíe el correo vacío
    if (!email.trim()) {
      toast.warning("Atención", {
        description: "Es necesario ingresar un correo electrónico para poder recuperar tu contraseña.",
      });
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Validar existencia y estado "aprobado" en la tabla usuarios
      const { data: dbUser, error: dbError } = await supabase
        .from("usuarios")
        .select("estado")
        .eq("correo", email.trim().toLowerCase())
        .maybeSingle();

      if (dbError) {
        console.error("Error al comprobar el correo:", dbError);
        throw new Error("Error al verificar el correo en el sistema.");
      }

      // Si el correo no existe registrado en la base de datos
      if (!dbUser) {
        const msgError = "El correo electrónico ingresado no se encuentra registrado.";
        setError(msgError);
        toast.error(msgError); // Notificación flotante de error
        setEmail(""); 
        setIsLoading(false);
        return;
      }

      // Si existe pero no está aprobado (pendiente, suspendido, rechazado)
      if (dbUser.estado !== "aprobado") {
        let msgEstado = "";
        if (dbUser.estado === "pendiente") {
          msgEstado = "Tu cuenta aún está pendiente de aprobación por un administrador.";
        } else if (dbUser.estado === "suspendido") {
          msgEstado = "Esta cuenta se encuentra suspendida. No puedes restablecer contraseña.";
        } else if (dbUser.estado === "rechazado") {
          msgEstado = "Tu solicitud de acceso fue rechazada.";
        }
        
        setError(msgEstado);
        toast.error(msgEstado); // Notificación flotante de cuenta bloqueada
        setEmail(""); 
        setIsLoading(false);
        return;
      }

      // Si el usuario existe y está aprobado, se envía el enlace de recuperación
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (authError) throw authError;

      setSuccess(true);
      toast.success("Enlace enviado", {
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
    } catch (error: unknown) {
      const msgFinal = error instanceof Error ? error.message : "Ha ocurrido un error inesperado.";
      setError(msgFinal);
      toast.error(msgFinal);
      setEmail("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 px-10">
            <CardTitle className="text-2xl text-[#0d9488] font-bold uppercase tracking-tight text-center">Revisa tu correo</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded-2xl border border-teal-100 dark:border-teal-900/50 mb-6 text-center">  
              <p className="text-sm text-muted-foreground">
                Se han enviado con éxito las instrucciones de restablecimiento 
                al correo electrónico vinculado a tu cuenta. Por favor, verifica tu bandeja de entrada.
              </p>
            </div>
            <Link href="/auth/login" className="block w-full">
              <Button className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-xl font-bold transition-all active:scale-95">
                Volver al Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 px-10">
            <CardTitle className="text-2xl text-[#0d9488] font-bold tracking-tight text-center">
              Restablecer tu contraseña
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Introduce tu correo electrónico y te enviaremos un enlace para 
              restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <form onSubmit={handleForgotPassword} noValidate>
              <div className="flex flex-col gap-6">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="pl-10 bg-gray-50 border-gray-100 rounded-xl text-black h-12 focus-visible:ring-[#0d9488]"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-[11px] text-red-500 text-center font-bold bg-red-50 dark:bg-red-950/30 py-2 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in-50 duration-200">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-teal-100 transition-all active:scale-95"
                  disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar correo"}
                </Button>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="text-teal-600 font-bold hover:underline"
                >
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}