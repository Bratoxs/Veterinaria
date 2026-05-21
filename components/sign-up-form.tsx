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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    setIsLoading(true);
    setError(null);

    // Validar longitud mínima
    if (password.length < 6) {
      setError("La contraseña es muy corta (mínimo 6 caracteres)");
      setIsLoading(false);
      return;
    }

    // Validar que sean iguales
    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    // Validar si ya existe en tu tabla pública de perfiles
    const { data: usuarioExistente } = await supabase
      .from("profiles") // o el nombre de tu tabla pública de usuarios
      .select("id")
      .eq("email", email)
      .single();

    if (usuarioExistente) {
      setError("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
      setIsLoading(false);
      return; // Detenemos el registro aquí
    }

    // 2. Si no existe, procedemos con el signUp normal
    // const { error } = await supabase.auth.signUp({ email, password });

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });

      if (error) throw error;

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Capturar el error de límite de tasa (rate limit)
        if (error.message.toLowerCase().includes("rate limit exceeded")) {
          setError("Has realizado demasiados intentos. Por favor, inténtalo de nuevo más tarde.");
        } 
        // Capturar si el usuario ya existe (por si acaso lo necesitas)
        else if (error.message.toLowerCase().includes("user already exists")) {
          setError("Este correo electrónico ya está registrado.");
        } 
        // Cualquier otro error de Supabase en inglés lo dejas por defecto o genérico
        else {
          setError(error.message); 
          // O puedes usar un mensaje genérico: setError("Ocurrió un error al registrar la cuenta.");
        }
      } else {
        setError("Ha ocurrido un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="pt-12 px-10 pb-2 text-center">
          <CardTitle className="text-2xl text-[#0d9488] font-bold tracking-tight text-center">
            Registrarse
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Crear una nueva cuenta</CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
                
                {/* Email */}
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488]"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password */}
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
              </div>

              {/* Repeat Password */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="repeat-password"
                    type="password"
                    placeholder="Repetir Contraseña"
                    className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488]"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
              </div>
              
              {error && <p className="text-[10px] text-red-500 text-center font-bold">{error}</p>}
              
              <div className="pt-2">
                <Button type="submit" className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-teal-100 transition-all active:scale-95" disabled={isLoading}>
                  {isLoading ? "Creando cuenta..." : "Registrarse"}
                </Button>
              </div>
              
            </div>
            <div className="text-center text-xs text-gray-400 mt-4">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/auth/login" className="text-teal-600 font-bold hover:underline">
                Inicia Sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
