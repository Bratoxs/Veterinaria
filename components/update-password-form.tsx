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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const router = useRouter();

  // Limpia el formulario al entrar a la vista
  useEffect(() => {
    setPassword("");
    setRepeatPassword("");
    setError(null);
    setShowPassword(false);
    setShowRepeatPassword(false);
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // 1. Validación estricta de robustez (Igual que en el Registro)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, un número y un carácter especial.");
      setIsLoading(false);
      return;
    }

    // 2. Validación de coincidencia
    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) throw updateError;

      // Al actualizar con éxito, redirige a la ruta protegida (ya tiene sesión activa por el token)
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ha ocurrido un error inesperado");
      setPassword("");
      setRepeatPassword(""); // Limpiamos campos por seguridad ante fallos
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="pt-12 px-10 pb-2 text-center">
          <CardTitle className="text-2xl text-[#0d9488] font-bold tracking-tight text-center">
            Restablecer contraseña
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Por favor, introduce y confirma tu nueva contraseña de acceso a continuación.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-5">
              
              {/* Nueva Contraseña con Ojo */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    className="pl-10 pr-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488]"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-normal pl-1 leading-tight">
                  Mínimo 6 caracteres, 1 mayúscula, 1 número y 1 carácter especial.
                </p>
              </div>

              {/* Repetir Nueva Contraseña con Ojo */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Confirmar nueva contraseña"
                    className="pl-10 pr-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488]"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-red-500 text-center font-bold bg-red-50 dark:bg-red-950/30 py-2 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in-50 duration-200">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-teal-100 transition-all active:scale-95"
                  disabled={isLoading}
                >
                  {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
                </Button>
              </div>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}