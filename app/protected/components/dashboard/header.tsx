import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden text-slate-500" title="Abrir menú">
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:block">
          Panel de Administración de la Clínica
        </div>
        <Link href="/protected" className="text-[#0d9488] font-bold text-sm block sm:hidden">
          🐾 VetCare
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="text-xs text-slate-400 animate-pulse">Cargando...</div>}>
          <AuthButton />
        </Suspense>
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
        <ThemeSwitcher />
      </div>
    </header>
  );
}