"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Lock } from "lucide-react";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Aquí "atrapas" el error específico
        if (error.message === "Invalid login credentials") {
          setError("El correo o la contraseña son incorrectos");
        } else {
          setError(error.message);
        }
        setIsLoading(false);
      } else {
        // Update this route to redirect to an authenticated route. The user already has an active session.
        router.push("/protected");
        // router.refresh();
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ha ocurrido un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
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
                    width={112}  // El ancho del contenedor (w-28 = 112px)
                    height={112} // El alto del contenedor
                    className="object-cover" // Esto hace que la imagen llene el círculo sin deformarse
                  />
                </div>
                <h2 className="text-[#0d9488] text-xl font-bold tracking-widest uppercase">Veterinaria</h2>
              </div>

              {/* Input de Usuario con Icono */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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

              {/* Input de Password con Icono */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488]"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
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

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              {/* Botón */}
              <Button 
                type="submit" 
                className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-teal-100 transition-all active:scale-95" 
                disabled={isLoading}>
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
              </Button>

            </div>
            <div className="text-center text-xs text-gray-400 mt-4">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/sign-up" className="text-teal-600 font-bold hover:underline">
                Registrarse
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
