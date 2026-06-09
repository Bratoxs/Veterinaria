export interface Propietario {
  id: string;
  nombre_completo: string;
  correo: string | null;
  telefono: string | null;
  cedula: string;
  direccion: string | null;
  created_at: string | null;
  // Relación opcional para incluir sus mascotas al consultar
  pacientes?: Paciente[];
}

export interface Paciente {
  id: string;
  nombre: string;
  especie: "Perro" | "Gato" | "Ave" | "Exótico" | "Otro";
  raza: string | null;
  color: string | null;
  peso_kg: number | null;
  fecha_nacimiento: string | null; // Se maneja como string YYYY-MM-DD en los inputs de HTML
  genero: "Macho" | "Hembra" | null;
  esterilizado: boolean;
  propietario_id: string;
  created_at: string | null;
}