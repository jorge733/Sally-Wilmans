"use client";

import { clp, diasHabiles, rangoDias, sumarDias } from "@/lib/format";
import { libresSemana } from "@/lib/salida-utils";
import type { Semana } from "@/lib/types";

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

const mesDe = (f: string) =>
  new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${f}T12:00:00Z`),
  );

/** Lunes de la semana de una fecha. */
function lunesDe(f: string): string {
  const dia = new Date(`${f}T12:00:00Z`).getUTCDay();
  return sumarDias(f, dia === 0 ? -6 : 1 - dia);
}

/**
 * Calendario de lunes a viernes donde cada fila es una semana del club.
 * Al tocar una fila se elige (o se quita) la semana completa.
 */
export function SelectorSemanas({
  semanas,
  abiertas,
  elegidas,
  cambiar,
  ninos,
}: {
  semanas: Semana[];
  /** Ids de las semanas que todavía reciben inscripciones */
  abiertas: string[];
  elegidas: string[];
  cambiar: (ids: string[]) => void;
  ninos: number;
}) {
  const meses = new Map<string, Semana[]>();
  for (const w of semanas) meses.set(mesDe(w.inicio), [...(meses.get(mesDe(w.inicio)) ?? []), w]);

  const alternar = (id: string) =>
    cambiar(elegidas.includes(id) ? elegidas.filter((x) => x !== id) : [...elegidas, id]);
  const disponibles = semanas.filter((w) => abiertas.includes(w.id) && libresSemana(w) >= ninos);
  const todas = disponibles.length > 0 && disponibles.every((w) => elegidas.includes(w.id));

  return (
    <div className="space-y-6">
      {[...meses].map(([mes, lista]) => (
        <div key={mes}>
          <h3 className="mb-2 font-semibold first-letter:uppercase">{mes}</h3>
          <div className="grid grid-cols-5 gap-1.5 pb-1 text-center text-[11px] font-semibold tracking-wider text-gris uppercase px-2 sm:mr-36">
            {DIAS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <ul className="space-y-2">
            {lista.map((w) => {
              const lunes = lunesDe(w.inicio);
              const libres = libresSemana(w);
              const abierta = abiertas.includes(w.id);
              const cabe = abierta && libres >= ninos;
              const elegida = elegidas.includes(w.id);
              const estado = !abierta
                ? libres === 0
                  ? "Completa"
                  : "Ya partió"
                : libres < ninos
                  ? libres === 1
                    ? "Queda 1 cupo"
                    : `Quedan ${libres} cupos`
                  : libres <= 3
                    ? libres === 1
                      ? "¡Queda 1 cupo!"
                      : `¡Quedan ${libres} cupos!`
                    : `${diasHabiles(w.inicio, w.fin)} días`;
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={elegida}
                    aria-label={`Semana del ${rangoDias(w.inicio, w.fin)}, ${clp(w.precio)} por niño. ${estado}`}
                    disabled={!cabe && !elegida}
                    onClick={() => alternar(w.id)}
                    className={`grid w-full grid-cols-5 items-center gap-1.5 rounded-xl border-2 p-1.5 text-left transition sm:grid-cols-[repeat(5,minmax(0,1fr))_8.5rem] ${
                      elegida
                        ? "border-bosque bg-bosque/10"
                        : cabe
                          ? "border-linea bg-white hover:border-bosque/60"
                          : "cursor-not-allowed border-linea bg-crema opacity-60"
                    }`}
                  >
                    {DIAS.map((_, i) => {
                      const f = sumarDias(lunes, i);
                      const dentro = f >= w.inicio && f <= w.fin;
                      return (
                        <span
                          key={f}
                          className={`flex h-11 flex-col items-center justify-center rounded-lg text-sm font-semibold ${
                            !dentro
                              ? "text-linea line-through decoration-1"
                              : elegida
                                ? "bg-bosque text-white"
                                : "bg-crema text-tinta"
                          }`}
                        >
                          {Number(f.slice(8))}
                        </span>
                      );
                    })}
                    <span className="col-span-5 flex items-center justify-between gap-2 px-1 pt-1 text-sm sm:col-span-1 sm:block sm:pt-0 sm:text-right">
                      <span className="font-bold">{clp(w.precio)}</span>
                      <span
                        className={`block text-xs ${!cabe ? "text-gris" : libres <= 3 ? "font-semibold text-acento" : "text-gris"}`}
                      >
                        {elegida ? "✓ Elegida" : estado}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {disponibles.length > 1 && (
        <button
          type="button"
          onClick={() => cambiar(todas ? [] : disponibles.map((w) => w.id))}
          className="text-sm font-semibold text-bosque hover:underline"
        >
          {todas ? "Quitar todas" : "Elegir todas las semanas disponibles"}
        </button>
      )}
    </div>
  );
}
