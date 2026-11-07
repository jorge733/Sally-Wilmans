"use client";

import { useEffect, useRef, useState } from "react";
import type { FotoSalida } from "@/lib/types";

/** Grilla de fotos de una salida; al hacer clic se abren en grande. */
export function GaleriaSalida({ fotos, titulo }: { fotos: FotoSalida[]; titulo: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [actual, setActual] = useState<number | null>(null);

  const abrir = (i: number) => {
    setActual(i);
    dialogo.current?.showModal();
  };
  const mover = (paso: number) => setActual((i) => (i === null ? i : (i + paso + fotos.length) % fotos.length));

  useEffect(() => {
    if (actual === null) return;
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", teclas);
    return () => window.removeEventListener("keydown", teclas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual === null]);

  const foto = actual === null ? null : fotos[actual];

  return (
    <>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotos.map((f, i) => (
          <li key={f.path}>
            <button
              type="button"
              onClick={() => abrir(i)}
              className="group block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-crema"
              aria-label={`Ver foto ${i + 1} de ${fotos.length}${f.alt ? `: ${f.alt}` : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.url}
                alt={f.alt || `Foto ${i + 1} de ${titulo}`}
                loading="lazy"
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        onClose={() => setActual(null)}
        onClick={(e) => e.target === e.currentTarget && dialogo.current?.close()}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-tinta/90"
      >
        {foto && (
          <figure className="flex max-h-[92vh] w-[min(92vw,1200px)] flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto.url}
              alt={foto.alt || `Foto ${actual! + 1} de ${titulo}`}
              className="max-h-[82vh] w-auto rounded-xl object-contain"
            />
            <figcaption className="flex w-full items-center justify-between gap-4 text-sm text-white">
              <span>{foto.alt}</span>
              <span className="shrink-0 text-white/70">
                {actual! + 1} / {fotos.length}
              </span>
            </figcaption>
          </figure>
        )}
        <button
          type="button"
          onClick={() => dialogo.current?.close()}
          aria-label="Cerrar"
          className="fixed top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
        >
          ×
        </button>
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => mover(-1)}
              aria-label="Foto anterior"
              className="fixed top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              aria-label="Foto siguiente"
              className="fixed top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
            >
              ›
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
