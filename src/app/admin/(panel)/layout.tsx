import Link from "next/link";
import { Logo } from "@/components/Estructura";
import { requerirAdmin } from "@/lib/auth";
import { salir } from "./acciones";

export const dynamic = "force-dynamic";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  await requerirAdmin();
  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-linea bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 text-sm font-semibold" aria-label="Panel">
            <Link href="/admin" className="rounded-full px-3 py-2 hover:bg-crema">
              Salidas
            </Link>
            <Link href="/admin/encuesta" className="rounded-full px-3 py-2 hover:bg-crema">
              Encuesta
            </Link>
            <Link href="/admin/contenido" className="rounded-full px-3 py-2 hover:bg-crema">
              Contenido
            </Link>
            <Link href="/admin/ajustes" className="rounded-full px-3 py-2 hover:bg-crema">
              Ajustes
            </Link>
            <Link href="/" target="_blank" className="rounded-full px-3 py-2 hover:bg-crema">
              Ver sitio ↗
            </Link>
            <form action={salir}>
              <button className="rounded-full px-3 py-2 text-gris hover:bg-crema hover:text-acento">Salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}
