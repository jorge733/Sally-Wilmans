"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconoFlecha, IconoWhatsapp } from "./Iconos";

type Enlace = { href: string; texto: string };

/**
 * Menú del encabezado en pantallas chicas (en computador el menú va a la vista).
 * Se dibuja directo en <body>: el encabezado tiene backdrop-blur y eso encerraría
 * un panel `fixed` dentro de su propia caja.
 */
export function MenuCelular({
  enlaces,
  logo,
  whatsapp,
}: {
  enlaces: Enlace[];
  logo: React.ReactNode;
  whatsapp?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const disparador = boton.current;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();

    // Escape cierra; Tab da la vuelta dentro del panel mientras está abierto.
    function teclado(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierto(false);
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focos = panel.current.querySelectorAll<HTMLElement>("a, button");
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
    document.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", teclado);
      disparador?.focus();
    };
  }, [abierto]);

  // Si giran el teléfono o agrandan la ventana hasta el tamaño computador, se cierra solo.
  useEffect(() => {
    if (!abierto) return;
    const grande = window.matchMedia("(min-width: 768px)");
    const cambio = () => grande.matches && setAbierto(false);
    grande.addEventListener("change", cambio);
    return () => grande.removeEventListener("change", cambio);
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(true)}
        className="-mr-1 grid size-10 place-items-center rounded-full text-marca hover:bg-black/5 md:hidden"
        aria-label="Abrir menú"
        aria-expanded={abierto}
        aria-controls="menu-celular"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="menu-fondo absolute inset-0 bg-tinta/40" onClick={cerrar} aria-hidden />
            <div
              ref={panel}
              id="menu-celular"
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              className="menu-panel relative max-h-full overflow-y-auto rounded-b-3xl bg-[#fbf8f1] px-4 pt-3 pb-6 shadow-xl"
            >
              <div className="flex items-center justify-between" onClick={cerrar}>
                {logo}
                <button
                  type="button"
                  onClick={cerrar}
                  className="-mr-1 grid size-10 place-items-center rounded-full text-marca hover:bg-black/5"
                  aria-label="Cerrar menú"
                >
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Principal" className="mt-4">
                <ul className="divide-y divide-linea">
                  {enlaces.map((e) => (
                    <li key={e.href}>
                      <Link
                        href={e.href}
                        onClick={cerrar}
                        className="flex items-center justify-between py-3.5 font-serif text-xl font-semibold text-marca"
                      >
                        {e.texto}
                        <IconoFlecha className="size-4 text-acento" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-5 grid gap-3">
                <Link href="/#salidas" onClick={cerrar} className="btn btn-primario">
                  Inscribir
                </Link>
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener"
                    onClick={cerrar}
                    className="btn btn-secundario text-marca"
                  >
                    <IconoWhatsapp className="size-5 text-[#25d366]" /> Escríbenos por WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
