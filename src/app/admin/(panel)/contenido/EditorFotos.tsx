"use client";

import { useRef, useState } from "react";
import { achicar } from "@/lib/achicar-foto";
import {
  cuadrosGaleria,
  FORMATOS,
  MAX_FOTOS_GALERIA,
  NOMBRE_FORMATO,
  srcFoto,
  type Formato,
  type FotoSitio,
  type FotosSitio,
  type LugarFoto,
} from "@/lib/fotos-sitio";
import {
  editarFotoSitio,
  moverFotoGaleria,
  quitarFotoGaleria,
  restablecerFotoSitio,
  subirFotoSitio,
  type RespuestaFotos,
} from "./acciones-fotos";

/** Zona para elegir o arrastrar fotos. */
function ZonaSubir({
  texto,
  multiple,
  ocupada,
  subir,
}: {
  texto: string;
  multiple?: boolean;
  ocupada: boolean;
  subir: (archivos: File[]) => void;
}) {
  const [arrastrando, setArrastrando] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastrando(false);
        if (!ocupada) subir(Array.from(e.dataTransfer.files));
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm transition ${
        arrastrando ? "border-marca bg-crema" : "border-linea hover:border-marca/50 hover:bg-crema/50"
      } ${ocupada ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={ocupada}
        onChange={(e) => {
          if (e.target.files) subir(Array.from(e.target.files));
          e.target.value = "";
        }}
        className="sr-only"
      />
      <span className="font-semibold text-marca">{texto}</span>
      <span className="text-gris">Arrástrala aquí o haz clic para elegirla</span>
    </label>
  );
}

/** Descripción de una foto: se guarda al salir del campo. */
function Descripcion({ foto, guardar }: { foto: FotoSitio; guardar: (alt: string) => void }) {
  return (
    <input
      key={foto.id}
      defaultValue={foto.alt}
      maxLength={200}
      placeholder="Describe la foto (para buscadores y lectores de pantalla)"
      aria-label="Descripción de la foto"
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      onBlur={(e) => e.target.value.trim() !== foto.alt && guardar(e.target.value)}
      className="campo py-1.5 text-sm"
    />
  );
}

export function EditorFotos({ fotosIniciales }: { fotosIniciales: FotosSitio }) {
  const [fotos, setFotos] = useState(fotosIniciales);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<{ hecho: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const bloqueado = ocupado !== null || progreso !== null;

  async function ejecutar(clave: string, accion: () => Promise<RespuestaFotos>) {
    setError("");
    setOcupado(clave);
    try {
      const r = await accion();
      if (r.error) setError(r.error);
      else if (r.fotos) setFotos(r.fotos);
    } catch {
      setError("Algo falló. Recarga la página e inténtalo de nuevo.");
    } finally {
      setOcupado(null);
    }
  }

  async function subir(lugar: LugarFoto, archivos: File[]) {
    setError("");
    if (!archivos.length) return;
    const libres = lugar === "galeria" ? MAX_FOTOS_GALERIA - fotos.galeria.length : 1;
    const aSubir = archivos.slice(0, Math.max(0, libres));
    if (archivos.length > aSubir.length && lugar === "galeria") {
      setError(`La galería puede tener hasta ${MAX_FOTOS_GALERIA} fotos. Se subieron las primeras.`);
    }
    if (!aSubir.length) return;
    setProgreso({ hecho: 0, total: aSubir.length });
    const errores: string[] = [];
    for (const [i, archivo] of aSubir.entries()) {
      try {
        const form = new FormData();
        form.append("foto", await achicar(archivo));
        const r = await subirFotoSitio(lugar, form);
        if (r.error) errores.push(r.error);
        else if (r.fotos) setFotos(r.fotos);
      } catch (e) {
        errores.push(e instanceof Error ? e.message : `No se pudo subir "${archivo.name}".`);
      }
      setProgreso({ hecho: i + 1, total: aSubir.length });
    }
    setProgreso(null);
    if (errores.length) setError([...new Set(errores)].join(" "));
  }

  const restablecer = (lugar: LugarFoto, pregunta: string) => {
    if (confirm(pregunta)) void ejecutar(lugar, () => restablecerFotoSitio(lugar));
  };

  const cuadros = cuadrosGaleria(fotos.galeria);
  const btn = "rounded-lg px-2 py-1 hover:bg-crema disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="space-y-6">
      <p className="text-sm text-gris">
        Los cambios de fotos se guardan al instante. Las fotos se achican solas antes de subir.
      </p>

      {/* Portada y Quiénes somos */}
      <div className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ["portada", "Foto de la portada", "La grande de arriba, junto al título."],
            ["nosotros", "Foto de «Quiénes somos»", "Junto al texto del club."],
          ] as const
        ).map(([lugar, titulo, ayuda]) => {
          const f = fotos[lugar];
          return (
            <div key={lugar} className={`space-y-3 ${ocupado === lugar ? "opacity-60" : ""}`}>
              <div>
                <p className="font-semibold">{titulo}</p>
                <p className="text-sm text-gris">{ayuda}</p>
              </div>
              <div className="overflow-hidden rounded-xl bg-crema">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={srcFoto(f)} alt={f.alt} className="aspect-[4/3] w-full object-cover" />
              </div>
              <Descripcion foto={f} guardar={(alt) => ejecutar(lugar, () => editarFotoSitio(lugar, f.id, { alt }))} />
              <ZonaSubir texto="Cambiar foto" ocupada={bloqueado} subir={(a) => subir(lugar, a)} />
              {!f.clave && (
                <button
                  type="button"
                  disabled={bloqueado}
                  onClick={() => restablecer(lugar, "¿Volver a la foto original? La foto subida se borra.")}
                  className="text-sm text-gris hover:text-acento disabled:opacity-40"
                >
                  Volver a la foto original
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Galería */}
      <div className="space-y-3 border-t border-linea pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold">Fotos de la galería</p>
          <span className="text-sm text-gris">
            {fotos.galeria.length} de {MAX_FOTOS_GALERIA}
          </span>
        </div>
        <p className="text-sm text-gris">
          La grilla tiene 4 columnas. Elige el tamaño de cada foto: las «Altas» quedan bien con fotos verticales y las
          «Anchas» con fotos horizontales.
        </p>
        {cuadros % 4 !== 0 && fotos.galeria.length > 0 && (
          <p className="rounded-xl bg-crema px-4 py-2 text-sm text-marca">
            Con estos tamaños la última fila queda incompleta (faltan {4 - (cuadros % 4)} cuadro
            {4 - (cuadros % 4) === 1 ? "" : "s"}). Cambia el tamaño de alguna foto o agrega otra para completarla.
          </p>
        )}

        {fotos.galeria.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fotos.galeria.map((f, i) => (
              <li key={f.id} className={`overflow-hidden rounded-xl border border-linea ${ocupado === f.id ? "opacity-50" : ""}`}>
                <div className="relative aspect-[16/10] bg-crema">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={srcFoto(f)} alt={f.alt} className="size-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-marca">
                    {i + 1}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  <Descripcion foto={f} guardar={(alt) => ejecutar(f.id, () => editarFotoSitio("galeria", f.id, { alt }))} />
                  <select
                    value={f.formato}
                    disabled={bloqueado}
                    aria-label="Tamaño en la grilla"
                    onChange={(e) => {
                      const formato = e.target.value as Formato;
                      void ejecutar(f.id, () => editarFotoSitio("galeria", f.id, { formato }));
                    }}
                    className="campo py-1.5 text-sm"
                  >
                    {FORMATOS.map((x) => (
                      <option key={x} value={x}>
                        {NOMBRE_FORMATO[x]}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 text-sm">
                    <button
                      type="button"
                      className={btn}
                      disabled={bloqueado || i === 0}
                      onClick={() => ejecutar(f.id, () => moverFotoGaleria(f.id, i - 1))}
                      aria-label="Mover antes"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className={btn}
                      disabled={bloqueado || i === fotos.galeria.length - 1}
                      onClick={() => ejecutar(f.id, () => moverFotoGaleria(f.id, i + 1))}
                      aria-label="Mover después"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      disabled={bloqueado}
                      onClick={() => {
                        if (confirm("¿Quitar esta foto de la galería?")) void ejecutar(f.id, () => quitarFotoGaleria(f.id));
                      }}
                      className="ml-auto rounded-lg px-2 py-1 font-medium text-acento hover:bg-acento/10 disabled:opacity-30"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {fotos.galeria.length < MAX_FOTOS_GALERIA && (
          <ZonaSubir texto="Agregar fotos a la galería" multiple ocupada={bloqueado} subir={(a) => subir("galeria", a)} />
        )}
        <button
          type="button"
          disabled={bloqueado}
          onClick={() => restablecer("galeria", "¿Volver a la galería original? Las fotos subidas a la galería se borran.")}
          className="text-sm text-gris hover:text-acento disabled:opacity-40"
        >
          Volver a la galería original
        </button>
      </div>

      {progreso && (
        <p className="rounded-xl bg-crema px-4 py-2 text-sm font-semibold text-marca">
          Subiendo {Math.min(progreso.hecho + 1, progreso.total)} de {progreso.total}…
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-acento/10 px-4 py-2 text-sm font-medium text-acento">
          {error}
        </p>
      )}
    </div>
  );
}
