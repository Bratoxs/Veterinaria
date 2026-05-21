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
import { useState } from "react";
import { Mail } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ha ocurrido un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 px-10">
            <CardTitle className="text-2xl text-[#0d9488] font-bold uppercase tracking-tight text-center">Revisa tu correo</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 mb-6 text-center">  
              <p className="text-sm text-muted-foreground">
                Si el usuario es válido, se han enviado las instrucciones de restablecimiento 
                al correo electrónico vinculado a tu cuenta en breve.
              </p>
            </div>
            <Link href="/auth/login" className="block w-full">
              <Button className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-xl font-bold transition-all">
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
            <form onSubmit={handleForgotPassword}>
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
                {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
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
