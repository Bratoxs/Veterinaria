// app/protected/pacientes/page.tsx
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import GestionPacientesClient from "../components/pacientes/GestionPacientesClient";
import { Propietario, Paciente } from "@/types/veterinaria";

export default async function GestionPacientesPage() {
  
  /**
   * SERVER ACTION: Registrar o verificar al Propietario
   * Si la cédula ya existe, devuelve el propietario existente; si no, crea uno nuevo.
   */
  async function handleProcesarPropietarioAction(datos: Partial<Propietario>) {
    "use server";

    const supabase = await createClient();

    if (!datos.cedula || !datos.nombre_completo) {
      throw new Error("Cédula y nombre completo son requeridos.");
    }

    // 1. Intentar buscar si ya existe un propietario con esa misma cédula
    const { data: existente } = await supabase
      .from("propietarios")
      .select("*, pacientes(*)")
      .eq("cedula", datos.cedula)
      .maybeSingle();

    if (existente) {
      return existente as Propietario;
    }

    // 2. Si no existe, lo insertamos en la base de datos
    const { data: nuevo, error: insertError } = await supabase
      .from("propietarios")
      .insert([
        {
          nombre_completo: datos.nombre_completo,
          cedula: datos.cedula,
          telefono: datos.telefono || null,
          correo: datos.correo || null,
          direccion: datos.direccion || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error al registrar propietario: ${insertError.message}`);
    }

    // Retornamos el nuevo propietario con un array de pacientes vacío
    return { ...nuevo, pacientes: [] } as Propietario;
  }

  /**
   * SERVER ACTION: Registrar y vincular un Paciente (Mascota) al dueño activo
   */
  async function handleGuardarPacienteAction(datos: Partial<Paciente>) {
    "use server";

    const supabase = await createClient();

    if (!datos.propietario_id || !datos.nombre) {
      throw new Error("Datos de vinculación incompletos.");
    }

    const { data: nuevaMascota, error: insertError } = await supabase
      .from("pacientes")
      .insert([
        {
          nombre: datos.nombre,
          especie: datos.especie,
          raza: datos.raza || null,
          color: datos.color || null,
          peso_kg: datos.peso_kg || null,
          fecha_nacimiento: datos.fecha_nacimiento || null,
          genero: datos.genero || null,
          esterilizado: datos.esterilizado ?? false,
          propietario_id: datos.propietario_id, // UUID foráneo entregado por el Paso 1
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error al registrar mascota: ${insertError.message}`);
    }

    // Opcional: Revalidamos rutas donde se listen reportes globales de mascotas
    revalidatePath("/protected/pacientes");
    return nuevaMascota as Paciente;
  }

  return (
    <GestionPacientesClient 
      onProcesarPropietario={handleProcesarPropietarioAction}
      onGuardarPaciente={handleGuardarPacienteAction}
    />
  );
}