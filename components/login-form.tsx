"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Se ejecuta al montar el componente para asegurar estados limpios
  useEffect(() => {
    setUsername("");
    setPassword("");
    setError(null);
    setShowPassword(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Buscar el usuario por su username para obtener su correo y estado
      const { data: dbUser, error: dbError } = await supabase
        .from("usuarios")
        .select("correo, estado")
        .eq("username", username.trim())
        .maybeSingle(); // Evita lanzar excepciones si no encuentra nada

      if (dbError) {
        console.log("Error al consultar el usuario en la base de datos:", dbError);
        throw new Error("Error al verificar las credenciales en el sistema.");
      }

      if (!dbUser) {
        setError("El usuario o la contraseña son incorrectos");
        setPassword("");
        setIsLoading(false);
        return;
      }

      // 2. Controlar los flujos de estado según tus requerimientos
      if (dbUser.estado !== "aprobado") {
        if (dbUser.estado === "pendiente") {
          setError(
            "Tu cuenta aún está pendiente de aprobación por un administrador.",
          );
        } else if (dbUser.estado === "suspendido") {
          setError("Esta cuenta se encuentra suspendida temporalmente.");
        } else if (dbUser.estado === "rechazado") {
          setError("Tu solicitud de acceso ha sido rechazada.");
        }
        setIsLoading(false);
        setPassword(""); // Limpiamos el input de contraseña
        return;
      }

      // 3. Si está aprobado, hacemos el login real usando el correo obtenido internamente
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: dbUser.correo,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("El usuario o la contraseña son incorrectos");
        } else {
          setError(authError.message);
        }
        setPassword(""); // Limpiamos el input de contraseña si falla la autenticación en Auth
        setIsLoading(false);
      } else {
        router.push("/protected");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ha ocurrido un error");
      setPassword(""); // Limpiamos el input de contraseña ante cualquier excepción imprevista
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-10">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              {/* Header con Imagen Circular*/}
              <div className="flex flex-col items-center mb-2">
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-teal-100 shadow-sm">
                  {/* Aquí puedes poner la imagen de los doctores/mascotas */}
                  <Image
                    src="/Veter1.png" // Ruta a tu imagen en la carpeta public
                    alt="Logo Veterinaria"
                    width={112} // El ancho del contenedor (w-28 = 112px)
                    height={112} // El alto del contenedor
                    className="object-cover" // Esto hace que la imagen llene el círculo sin deformarse
                  />
                </div>
                <h2 className="text-[#0d9488] text-xl font-bold tracking-widest">
                  VetCare
                </h2>
                <p className="text-[11px] text-slate-500 font-bold">
                  Sistema de Gestión Veterinaria
                </p>
              </div>

              {/* Input de Usuario (Username) con Icono */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="username"
                  type="text" // Cambiado de email a text
                  placeholder="Nombre de usuario" // Placeholder más intuitivo
                  className="pl-10 bg-gray-50 border-gray-100 rounded-xl text-black h-12 focus-visible:ring-[#0d9488]"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Input de Password con Icono */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
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
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-teal-600 font-bold hover:underline text-xs"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-red-500 text-center font-bold bg-red-50 dark:bg-red-950/30 py-2 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in-50 duration-200">{error}</p>
              )}

              {/* Botón */}
              <Button
                type="submit"
                className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-teal-100 transition-all active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </div>
            <div className="text-center text-xs text-gray-400 mt-4">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/auth/sign-up"
                className="text-teal-600 font-bold hover:underline"
              >
                Registrarse
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
