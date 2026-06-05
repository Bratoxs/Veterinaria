
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
      <p className="text-xs font-semibold text-slate-500 animate-pulse">
        Cargando solicitudes pendientes...
      </p>
    </div>
  );
}