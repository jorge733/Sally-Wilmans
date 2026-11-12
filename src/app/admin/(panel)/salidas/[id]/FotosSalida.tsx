"use client";

import { useRef, useState } from "react";
import { achicar } from "@/lib/achicar-foto";
import { MAX_FOTOS_SALIDA } from "@/lib/salida-utils";
import type { FotoSalida } from "@/lib/types";
import { borrarFotoSalida, describirFotoSalida, moverFotoSalida, subirFotoSalida } from "../../acciones";

export function FotosSalida({ id, fotosIniciales }: { id: string; fotosIniciales: FotoSalida[] }) {
  const [fotos, setFotos] = useState(fotosIniciales);
  const [progreso, setProgreso] = useState<{ hecho: number; total: number } | null>(null);
  const [ocupada, setOcupada] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const libres = MAX_FOTOS_SALIDA - fotos.length;
  const subiendo = progreso !== null;

  async function subir(lista: FileList | File[]) {
    setError("");
    const archivos = Array.from(lista);
    if (!archivos.length) return;
    if (archivos.length > libres) {
      setError(
        libres > 0
          ? `Solo puedes agregar ${libres} foto${libres === 1 ? "" : "s"} más (máximo ${MAX_FOTOS_SALIDA}). Se subirán las primeras.`
          : `Ya tienes ${MAX_FOTOS_SALIDA} fotos. Borra alguna para subir otras.`,
      );
    }
    const aSubir = archivos.slice(0, Math.max(0, libres));
    if (!aSubir.length) return;

    setProgreso({ hecho: 0, total: aSubir.length });
    const errores: string[] = [];
    for (const [i, archivo] of aSubir.entries()) {
      try {
        const form = new FormData();
        form.append("foto", await achicar(archivo));
        const r = await subirFotoSalida(id, form);
        if (r.error) errores.push(r.error);
        else if (r.fotos) setFotos(r.fotos);
      } catch (e) {
        errores.push(e instanceof Error ? e.message : `No se pudo subir "${archivo.name}".`);
      }
      setProgreso({ hecho: i + 1, total: aSubir.length });
    }
    setProgreso(null);
    if (errores.length) setError([...new Set(errores)].join(" "));
    if (input.current) input.current.value = "";
  }

  async function ejecutar(path: string, accion: () => Promise<{ error?: string; fotos?: FotoSalida[] }>) {
    setError("");
    setOcupada(path);
    try {
      const r = await accion();
      if (r.error) setError(r.error);
      else if (r.fotos) setFotos(r.fotos);
    } catch {
      setError("Algo falló. Recarga la página e inténtalo de nuevo.");
    } finally {
      setOcupada(null);
    }
  }

  return (
    <section className="mt-6 space-y-4 rounded-2xl bg-white p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Fotos</h2>
        <span className="text-sm text-gris">
          {fotos.length} de {MAX_FOTOS_SALIDA}
        </span>
      </div>
      <p className="text-sm text-gris">
        La primera es la portada: se ve en la tarjeta de la salida y arriba de su página. Las demás aparecen en la
        galería de la salida. Los cambios de fotos se guardan al instante.
      </p>

      {fotos.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fotos.map((f, i) => {
            const bloqueada = subiendo || ocupada !== null;
            return (
              <li
                key={f.path}
                className={`overflow-hidden rounded-xl border ${i === 0 ? "border-marca ring-2 ring-marca/20" : "border-linea"} ${ocupada === f.path ? "opacity-50" : ""}`}
              >
                <div className="relative aspect-[16/10] bg-crema">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.alt} className="size-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-marca px-2.5 py-0.5 text-xs font-semibold text-white">
                      Portada
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <input
                    defaultValue={f.alt}
                    maxLength={200}
                    placeholder="Descripción (opcional)"
                    aria-label={`Descripción de la foto ${i + 1}`}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    onBlur={(e) => {
                      if (e.target.value.trim() !== f.alt) {
                        const alt = e.target.value;
                        void ejecutar(f.path, () => describirFotoSalida(id, f.path, alt));
                      }
                    }}
                    className="campo py-1.5 text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-1 text-sm">
                    <button
                      type="button"
                      disabled={bloqueada || i === 0}
                      onClick={() => ejecutar(f.path, () => moverFotoSalida(id, f.path, i - 1))}
                      aria-label="Mover a la izquierda"
                      title="Mover antes"
                      className="rounded-lg px-2 py-1 hover:bg-crema disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={bloqueada || i === fotos.length - 1}
                      onClick={() => ejecutar(f.path, () => moverFotoSalida(id, f.path, i + 1))}
                      aria-label="Mover a la derecha"
                      title="Mover después"
                      className="rounded-lg px-2 py-1 hover:bg-crema disabled:opacity-30"
                    >
                      →
                    </button>
                    {i > 0 && (
                      <button
                        type="button"
                        disabled={bloqueada}
                        onClick={() => ejecutar(f.path, () => moverFotoSalida(id, f.path, 0))}
                        className="rounded-lg px-2 py-1 font-medium text-marca hover:bg-crema disabled:opacity-30"
                      >
                        Usar de portada
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={bloqueada}
                      onClick={() => {
                        if (confirm("¿Borrar esta foto?")) void ejecutar(f.path, () => borrarFotoSalida(id, f.path));
                      }}
                      className="ml-auto rounded-lg px-2 py-1 font-medium text-acento hover:bg-acento/10 disabled:opacity-30"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {libres > 0 && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            if (!subiendo) void subir(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            arrastrando ? "border-marca bg-crema" : "border-linea hover:border-marca/50 hover:bg-crema/50"
          } ${subiendo ? "pointer-events-none opacity-70" : ""}`}
        >
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            disabled={subiendo}
            onChange={(e) => e.target.files && subir(e.target.files)}
            className="sr-only"
          />
          {subiendo ? (
            <>
              <span className="font-semibold text-marca">
                Subiendo {Math.min(progreso.hecho + 1, progreso.total)} de {progreso.total}…
              </span>
              <span className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-linea">
                <span
                  className="block h-full rounded-full bg-bosque transition-all"
                  style={{ width: `${(progreso.hecho / progreso.total) * 100}%` }}
                />
              </span>
            </>
          ) : (
            <>
              <span className="font-semibold text-marca">
                {fotos.length ? "Agregar más fotos" : "Subir fotos de la salida"}
              </span>
              <span className="text-sm text-gris">
                Arrástralas aquí o haz clic para elegirlas · puedes elegir varias a la vez
              </span>
            </>
          )}
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-acento/10 px-4 py-2 text-sm font-medium text-acento">
          {error}
        </p>
      )}
    </section>
  );
}
