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
import {
  Lock,
  Mail,
  SquareUser,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Phone,
  Fingerprint,
} from "lucide-react";

// 1. Limpiamos la definición de los Props para recibir solo className de forma segura
interface SignUpFormProps {
  className?: string;
}

export function SignUpForm({ className }: SignUpFormProps) {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [username, setUsername] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Estado de carga del botón generar
  // Control de visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Estados para la validación visual y el Modal de Confirmación
  const [showValidationStyles, setShowValidationStyles] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const router = useRouter();
  
  // Función idéntica a la lógica de Postgres para limpiar caracteres
  const cleanString = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quita tildes y diéresis
      .replace(/[^a-zA-Z0-9]/g, ""); // Elimina caracteres especiales
  };

  // Función para generar el username dinámicamente consultando la BD
  const handleGenerateUsername = async () => {
    setError(null);
    if (!nombre.trim() || !apellido.trim()) {
      setError(
        "Por favor, ingresa tu nombre y apellido primero para generar el usuario.",
      );
      return;
    }

    setIsGenerating(true);
    const supabase = createClient();

    try {
      const firstNameClean = cleanString(nombre);
      const lastNameClean = cleanString(apellido);
      const nameLength = firstNameClean.length;

      let letterCount = 1;
      let suffix = 1;
      let finalUsername = "";
      let isUnique = false;

      // Bucle idéntico a tu trigger de base de datos
      while (!isUnique) {
        if (letterCount <= nameLength) {
          finalUsername =
            firstNameClean.substring(0, letterCount) + lastNameClean;
        } else {
          finalUsername = firstNameClean + lastNameClean + suffix;
          suffix++;
        }

        // Consultamos la tabla pública usuarios para ver si ya existe
        const { data, error: fetchError } = await supabase
          .from("usuarios")
          .select("username")
          .eq("username", finalUsername)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          isUnique = true; // El username está disponible
        } else {
          letterCount++; // Sigue iterando agregando una letra o un número
        }
      }

      setUsername(finalUsername);
    } catch (err: unknown) {
      console.error(err);
      setError("Error al comprobar la disponibilidad del usuario.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Función intermedia que valida los requisitos antes de abrir el Modal
  const handleSubmitVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Verificamos si el formulario pasa las validaciones nativas (required, type="email", etc.)
    if (!e.currentTarget.checkValidity()) {
      setShowValidationStyles(true);
      return;
    }

    // Validación de Cédula (10 dígitos exactos)
    if (cedula.length !== 10) {
      setError("El número de cédula debe tener exactamente 10 dígitos.");
      return;
    }

    if (!username) {
      setError("Debes generar un nombre de usuario antes de registrarte.");
      return;
    }

    // Validar que contenga solo números (ej. Ecuador: 09XXXXXXXX o similar)
    if (celular.length !== 10) {
      setError("El número de celular debe tener exactamente 10 dígitos.");
      return;
    }

    // Mínimo 6 caracteres, 1 Mayúscula, 1 Número y 1 Caracter Especial
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, un número y un carácter especial.",
      );
      return;
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Si todo es válido, abrimos el modal de confirmación en lugar de registrar directamente
    setShowConfirmModal(true);
  };

  // Función definitiva que se ejecuta al presionar "Continuar" dentro del Modal
  const executeSignUp = async () => {
    setShowConfirmModal(false);
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Consultar si la cédula ya existe en la tabla pública
      const { data: existingCedula, error: cedulaCheckError } = await supabase
        .from("usuarios")
        .select("cedula")
        .eq("cedula", cedula.trim())
        .maybeSingle();

      if (cedulaCheckError) throw cedulaCheckError;

      if (existingCedula) {
        setError("El número de cédula ya se encuentra registrado.");
        setIsLoading(false);
        return; // Frenamos el flujo aquí antes de llamar al signUp de Auth
      }

      // Registramos directamente mandando solo nombre, apellido, username, celular, estado en los metadatos
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            cedula: cedula.trim(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            username: username,
            celular: celular.trim(),
            estado: "pendiente",
          },
        },
      });

      if (signUpError) throw signUpError;

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        console.error("Error durante el registro:", error);

        if (msg.includes("rate limit exceeded")) {
          setError(
            "Has realizado demasiados intentos. Por favor, inténtalo más tarde.",
          );
        } else if (
          msg.includes("user already exists") ||
          msg.includes("already registered")
        ) {
          setError("Este correo electrónico ya está registrado.");
        } else if (msg.includes("database error saving new user")) {
          setError("Error al guardar el usuario en la base de datos. Por favor, inténtalo de nuevo.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Ha ocurrido un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="pt-12 px-10 pb-2 text-center">
          <CardTitle className="text-2xl text-[#0d9488] font-bold tracking-tight text-center">
            Registrarse
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Crear una nueva cuenta para tu sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          {/* El formulario maneja el grupo de validación mediante condicional de estado */}
          <form
            onSubmit={handleSubmitVerification}
            noValidate // Desactiva la burbuja nativa fea del navegador para usar nuestro diseño CSS
            className={cn(
              "group/form flex flex-col gap-5",
              showValidationStyles && "was-validated",
            )}
          >
            {/* Cédula de Identidad */}
            <div className="space-y-1 group/field">
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors [.was-validated_&]:group-has-[:invalid]/field:text-red-500" />
                <Input
                  id="cedula"
                  type="text"
                  placeholder="Número de Cédula"
                  maxLength={10}
                  className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488] transition-all [.was-validated_&]:invalid:border-red-500 [.was-validated_&]:invalid:bg-red-5/30"
                  required
                  value={cedula}
                  onChange={(e) => {
                    const valueClean = e.target.value.replace(/[^0-9]/g, "");
                    setCedula(valueClean);
                  }}
                />
              </div>
              <p className="hidden text-[10px] text-red-500 font-medium pl-1 [.was-validated_&]:group-has-[:invalid]/field:block">
                El número de cédula es obligatorio y debe contener solo números.
              </p>
            </div>

            {/* Nombre */}
            <div className="space-y-1 group/field">
              <div className="relative">
                <SquareUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors [.was-validated_&]:group-has-[:invalid]/field:text-red-500" />
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Nombre"
                  className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488] transition-all [.was-validated_&]:invalid:border-red-500 [.was-validated_&]:invalid:bg-red-50/30"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <p className="hidden text-[10px] text-red-500 font-medium pl-1 [.was-validated_&]:group-has-[:invalid]/field:block">
                El nombre es obligatorio.
              </p>
            </div>

            {/* Apellido */}
            <div className="space-y-1 group/field">
              <div className="relative">
                <SquareUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors [.was-validated_&]:group-has-[:invalid]/field:text-red-500" />
                <Input
                  id="apellido"
                  type="text"
                  placeholder="Apellido"
                  className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488] transition-all [.was-validated_&]:invalid:border-red-500 [.was-validated_&]:invalid:bg-red-50/30"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>
              <p className="hidden text-[10px] text-red-500 font-medium pl-1 [.was-validated_&]:group-has-[:invalid]/field:block">
                El apellido es obligatorio.
              </p>
            </div>

            {/* Usuario */}
            <div className="space-y-1 group/field">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Usuario asignado"
                    readOnly
                    className="pl-10 bg-teal-50/60 border-teal-100 text-teal-900 rounded-xl h-12 cursor-default select-none focus-visible:ring-transparent"
                    value={username}
                    required
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateUsername}
                  disabled={isGenerating || !nombre || !apellido}
                  className="h-12 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isGenerating && "animate-spin")}
                  />
                  Generar
                </Button>
              </div>
              <p className="text-[10px] text-slate-400 font-normal pl-1">
                {username
                  ? "✓ Nombre de usuario disponible y verificado."
                  : "Haz clic en Generar para asignar tu identificador único."}
              </p>
            </div>

            {/* Celular */}
            <div className="space-y-1 group/field">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors [.was-validated_&]:group-has-[:invalid]/field:text-red-500" />
                <Input
                  id="celular"
                  type="tel" // Tipo telefónico nativo
                  placeholder="Celular"
                  maxLength={10} // Limita longitud máxima razonable
                  className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488] transition-all [.was-validated_&]:invalid:border-red-500 [.was-validated_&]:invalid:bg-red-50/30"
                  required
                  value={celular}
                  onChange={(e) => {
                    // Reemplaza cualquier carácter que no sea número para limpiar la entrada en tiempo real
                    const valueClean = e.target.value.replace(/[^0-9]/g, "");
                    setCelular(valueClean);
                  }}
                />
              </div>
              <p className="hidden text-[10px] text-red-500 font-medium pl-1 [.was-validated_&]:group-has-[:invalid]/field:block">
                El número de celular es obligatorio para el registro del personal.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1 group/field">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors [.was-validated_&]:group-has-[:invalid]/field:text-red-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488] transition-all [.was-validated_&]:invalid:border-red-500 [.was-validated_&]:invalid:bg-red-50/30"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="hidden text-[10px] text-red-500 font-medium pl-1 [.was-validated_&]:group-has-[:invalid]/field:block">
                Ingresa un correo electrónico válido.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1 group/field">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors [.was-validated_&]:group-has-[:invalid]/field:text-red-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // Cambia dinámicamente de tipo
                  placeholder="Contraseña"
                  className="pl-10 pr-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488] transition-all [.was-validated_&]:invalid:border-red-500 [.was-validated_&]:invalid:bg-red-50/30"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Botón flotante para el Ojo */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-normal pl-1 leading-tight">
                Mínimo 6 caracteres, 1 mayúscula, 1 número y 1 carácter
                especial.
              </p>
            </div>

            {/* Repeat Password */}
            <div className="space-y-1 group/field">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors [.was-validated_&]:group-has-[:invalid]/field:text-red-500" />
                <Input
                  id="repeat-password"
                  type={showRepeatPassword ? "text" : "password"} // Cambia dinámicamente de tipo
                  placeholder="Repetir Contraseña"
                  className="pl-10 bg-gray-50 border-gray-100 text-black rounded-xl h-12 focus-visible:ring-[#0d9488] transition-all [.was-validated_&]:invalid:border-red-500 [.was-validated_&]:invalid:bg-red-50/30"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
                {/* Botón flotante para el Ojo */}
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showRepeatPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="hidden text-[10px] text-red-500 font-medium pl-1 [.was-validated_&]:group-has-[:invalid]/field:block">
                Debes repetir tu contraseña.
              </p>
            </div>

            {error && (
              <p className="text-[11px] text-red-500 text-center font-bold bg-red-50 py-2 rounded-xl border border-red-100 animate-in fade-in-50 duration-200">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#0d9488] hover:bg-[#0a7a70] text-white h-12 rounded-2xl font-bold shadow-teal-100 transition-all active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? "Procesando registro..." : "Registrarse"}
              </Button>
            </div>

            <div className="text-center text-xs text-gray-400 mt-4">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/auth/login"
                className="text-teal-600 font-bold hover:underline"
              >
                Inicia Sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* MODAL DE CONFIRMACIÓN CON TAILWIND (Se dibuja sobre toda la pantalla) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-amber-50 p-3 rounded-full text-amber-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Verifica tu correo electrónico
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Por favor, asegúrate de que el correo electrónico ingresado sea
                correcto antes de continuar con el registro:
              </p>
              <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl w-full text-sm font-semibold text-slate-700 break-all">
                {email}
              </div>
              <p className="text-[10px] text-amber-600 font-medium">
                Si el correo está mal escrito, no podrás recibir notificaciones.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-11 rounded-xl font-semibold text-xs transition-all active:scale-95 border-gray-200 dark:border-slate-800"
              >
                Cancelar y Revisar
              </Button>
              <Button
                type="button"
                onClick={executeSignUp}
                className="flex-1 h-11 rounded-xl font-bold bg-[#0d9488] hover:bg-[#0a7a70] text-white text-xs shadow-md shadow-teal-50 transition-all active:scale-95"
              >
                Sí, Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
