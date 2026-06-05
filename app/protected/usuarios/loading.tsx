import { Loader2 } from "lucide-react";

export default function UsuariosLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center text-slate-500 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="text-xs font-semibold tracking-wide">Cargando personal de VetCare...</p>
    </div>
  );
}