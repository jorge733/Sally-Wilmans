import Link from "next/link";
import { linkWhatsapp } from "@/lib/format";
import { SITIO } from "@/lib/site";
import type { AjustesSitio } from "@/lib/types";
import { IconoCorreo, IconoInstagram, IconoWhatsapp } from "./Iconos";

/** Montañas dibujadas a mano con un corazón, como el logo de los afiches del club. */
export function Logo({ claro = false }: { claro?: boolean }) {
  const trazo = claro ? "#f3eddf" : "#2f4a34";
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${SITIO.nombre}, inicio`}>
      <svg
        viewBox="0 0 48 40"
        className="h-9 w-11 shrink-0"
        aria-hidden
        fill="none"
        stroke={trazo}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 27 15 11l6 8 6-9 18 17" />
        <path d="m15 11 3 6 3-2M27 10l2.5 5 3-2" strokeWidth="1.8" />
        <path
          d="M24 37c-2.6-1.8-4.4-3.4-4.4-5.2 0-1.3 1-2.2 2.2-2.2.9 0 1.6.5 2.2 1.3.6-.8 1.3-1.3 2.2-1.3 1.2 0 2.2.9 2.2 2.2 0 1.8-1.8 3.4-4.4 5.2Z"
          fill={claro ? "#f6c68f" : "#c0663a"}
          stroke="none"
        />
      </svg>
      <span className={`mano text-[1.6rem] leading-[0.85] uppercase ${claro ? "text-crema" : "text-marca"}`}>
        Club de la
        <br />
        Montaña
      </span>
    </Link>
  );
}

export function Encabezado() {
  return (
    <header className="sticky top-0 z-30 border-b border-linea/70 bg-[#fbf8f1]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-gris md:flex" aria-label="Principal">
          <Link href="/#salidas" className="hover:text-tinta">Próximas fechas</Link>
          <Link href="/#como-funciona" className="hover:text-tinta">Cómo funciona</Link>
          <Link href="/#nosotros" className="hover:text-tinta">Quiénes somos</Link>
          <Link href="/#contacto" className="hover:text-tinta">Contacto</Link>
        </nav>
        <Link href="/#salidas" className="btn btn-primario px-4 py-2 text-sm">
          Inscribir
        </Link>
      </div>
    </header>
  );
}

export function Pie({ ajustes }: { ajustes: AjustesSitio }) {
  return (
    <footer className="bg-marca text-marca-claro">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo claro />
          <p className="mt-4 max-w-xs text-sm">{SITIO.bajada}. {SITIO.ciudad}.</p>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-semibold text-white">Contacto</div>
          <ul className="space-y-2">
            {ajustes.whatsapp && (
              <li>
                <a href={linkWhatsapp(ajustes.whatsapp)} className="inline-flex items-center gap-2 hover:text-white">
                  <IconoWhatsapp className="size-4" /> WhatsApp
                </a>
              </li>
            )}
            {ajustes.email && (
              <li>
                <a href={`mailto:${ajustes.email}`} className="inline-flex items-center gap-2 hover:text-white">
                  <IconoCorreo className="size-4" /> {ajustes.email}
                </a>
              </li>
            )}
            {ajustes.instagram && (
              <li>
                <a
                  href={`https://instagram.com/${ajustes.instagram}`}
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <IconoInstagram className="size-4" /> @{ajustes.instagram}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-semibold text-white">Pagos seguros</div>
          <p>Las inscripciones se pagan en línea con Flow: débito, crédito y otros medios.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        © {new Date().getFullYear()} {SITIO.nombre}
        <span className="mx-2 opacity-50">·</span>
        Sitio desarrollado por <a
          href="https://benedettowebs.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white hover:underline"
        >
          BenedettoWebs
        </a>
      </div>
    </footer>
  );
}

export function BotonWhatsapp({ numero }: { numero: string }) {
  if (!numero) return null;
  return (
    <a
      href={linkWhatsapp(numero, "Hola, tengo una consulta sobre las salidas del Club de la Montaña")}
      target="_blank"
      rel="noopener"
      className="no-print fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25d366] py-3 pr-4 pl-3 font-semibold text-white latido shadow-lg shadow-black/15 transition hover:scale-105 sm:right-6 sm:bottom-6"
      aria-label="Escríbenos por WhatsApp"
    >
      <IconoWhatsapp className="size-7" />
      <span className="hidden sm:inline">¿Dudas?</span>
    </a>
  );
}
