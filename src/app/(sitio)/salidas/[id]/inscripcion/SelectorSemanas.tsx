"use client";

import { clp, fechaLarga, rangoDias, sumarDias } from "@/lib/format";
import { diasSemana, libresDia, precioEleccion } from "@/lib/salida-utils";
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

const cupos = (n: number, exclamar = false) =>
  n === 1 ? (exclamar ? "¡Queda 1 cupo!" : "Queda 1 cupo") : exclamar ? `¡Quedan ${n} cupos!` : `Quedan ${n} cupos`;

/**
 * Calendario de lunes a viernes donde cada fila es una semana del club.
 * Con precio por día se toca cada día por separado o «Semana completa»; sin él, se toca la fila
 * y se elige (o se quita) la semana completa.
 */
export function SelectorSemanas({
  semanas,
  precioDia,
  abiertos,
  elegidos,
  cambiar,
  ninos,
}: {
  semanas: Semana[];
  precioDia: number | null;
  /** Días (YYYY-MM-DD) que todavía reciben inscripciones */
  abiertos: string[];
  /** Días elegidos (YYYY-MM-DD) */
  elegidos: string[];
  cambiar: (dias: string[]) => void;
  ninos: number;
}) {
  const conDias = Boolean(precioDia);
  const meses = new Map<string, Semana[]>();
  for (const w of semanas) meses.set(mesDe(w.inicio), [...(meses.get(mesDe(w.inicio)) ?? []), w]);

  const abierto = new Set(abiertos);
  const elegido = new Set(elegidos);
  const cabeDia = (w: Semana, f: string) => abierto.has(f) && libresDia(w, f) >= ninos;
  /** Días que se pueden elegir al tocar la semana completa. */
  const elegiblesSemana = (w: Semana) => {
    const dias = diasSemana(w);
    if (conDias) return dias.filter((f) => cabeDia(w, f) || elegido.has(f));
    return dias.every((f) => cabeDia(w, f)) ? dias : [];
  };

  const poner = (dias: string[], si: boolean) => {
    const nuevo = new Set(elegido);
    dias.forEach((f) => (si ? nuevo.add(f) : nuevo.delete(f)));
    cambiar([...nuevo].sort());
  };

  const disponibles = semanas.flatMap(elegiblesSemana);
  const todas = disponibles.length > 0 && disponibles.every((f) => elegido.has(f));

  return (
    <div className="space-y-6">
      {[...meses].map(([mes, lista]) => (
        <div key={mes}>
          <h3 className="mb-2 font-semibold first-letter:uppercase">{mes}</h3>
          <div className="grid grid-cols-5 gap-1.5 px-2 pb-1 text-center text-[11px] font-semibold tracking-wider text-gris uppercase sm:mr-40">
            {DIAS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <ul className="space-y-2">
            {lista.map((w) => {
              const dias = diasSemana(w);
              const lunes = lunesDe(w.inicio);
              const elegidosW = dias.filter((f) => elegido.has(f));
              const completa = elegidosW.length === dias.length;
              const elegibles = elegiblesSemana(w);
              const libres = Math.min(...dias.filter((f) => abierto.has(f)).map((f) => libresDia(w, f)), Infinity);
              const precioW = precioEleccion(w, elegidosW.length || dias.length, precioDia);
              const nombre = `Semana del ${rangoDias(w.inicio, w.fin)}`;
              const estado =
                elegibles.length === 0
                  ? dias.some((f) => abierto.has(f))
                    ? cupos(libres)
                    : dias.every((f) => libresDia(w, f) === 0)
                      ? "Completa"
                      : "Ya partió"
                  : libres <= 3
                    ? cupos(libres, true)
                    : `${dias.length} días`;

              const celdas = DIAS.map((_, i) => {
                const f = sumarDias(lunes, i);
                const dentro = f >= w.inicio && f <= w.fin;
                const si = elegido.has(f);
                const base = "flex h-11 flex-col items-center justify-center rounded-lg text-sm font-semibold";
                if (!dentro) {
                  return (
                    <span key={f} className={`${base} text-linea line-through decoration-1`}>
                      {Number(f.slice(8))}
                    </span>
                  );
                }
                if (!conDias) {
                  return (
                    <span key={f} className={`${base} ${si ? "bg-bosque text-white" : "bg-crema text-tinta"}`}>
                      {Number(f.slice(8))}
                    </span>
                  );
                }
                const cabe = cabeDia(w, f);
                const libresF = libresDia(w, f);
                return (
                  <button
                    key={f}
                    type="button"
                    role="checkbox"
                    aria-checked={si}
                    aria-label={`${fechaLarga(f)}${!abierto.has(f) ? (libresF === 0 ? ", completo" : ", ya pasó") : libresF <= 3 ? `, ${cupos(libresF).toLowerCase()}` : ""}`}
                    disabled={!cabe && !si}
                    onClick={() => poner([f], !si)}
                    className={`${base} border-2 transition ${
                      si
                        ? "border-bosque bg-bosque text-white"
                        : cabe
                          ? "border-transparent bg-crema text-tinta hover:border-bosque/60"
                          : "cursor-not-allowed border-transparent bg-crema text-gris line-through decoration-1 opacity-60"
                    }`}
                  >
                    {Number(f.slice(8))}
                    {cabe && libresF <= 3 && !si && <span className="text-[10px] font-normal text-acento">{libresF}</span>}
                  </button>
                );
              });

              const resumen = (
                <span className="flex items-center justify-between gap-2 sm:block sm:text-right">
                  <span className="font-bold">{clp(precioW)}</span>
                  <span
                    className={`block text-xs ${elegibles.length === 0 ? "text-gris" : libres <= 3 ? "font-semibold text-acento" : "text-gris"}`}
                  >
                    {completa
                      ? "✓ Semana completa"
                      : elegidosW.length
                        ? `✓ ${elegidosW.length} ${elegidosW.length === 1 ? "día" : "días"}`
                        : estado}
                  </span>
                </span>
              );

              if (!conDias) {
                const cabe = elegibles.length > 0;
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={completa}
                      aria-label={`${nombre}, ${clp(w.precio)} por niño. ${estado}`}
                      disabled={!cabe && !completa}
                      onClick={() => poner(dias, !completa)}
                      className={`grid w-full grid-cols-5 items-center gap-1.5 rounded-xl border-2 p-1.5 text-left transition sm:grid-cols-[repeat(5,minmax(0,1fr))_9.5rem] ${
                        completa
                          ? "border-bosque bg-bosque/10"
                          : cabe
                            ? "border-linea bg-white hover:border-bosque/60"
                            : "cursor-not-allowed border-linea bg-crema opacity-60"
                      }`}
                    >
                      {celdas}
                      <span className="col-span-5 px-1 pt-1 text-sm sm:col-span-1 sm:pt-0">{resumen}</span>
                    </button>
                  </li>
                );
              }

              const todaLaSemana = elegibles.length > 0 && elegibles.every((f) => elegido.has(f));
              return (
                <li
                  key={w.id}
                  role="group"
                  aria-label={nombre}
                  className={`grid grid-cols-5 items-center gap-1.5 rounded-xl border-2 p-1.5 transition sm:grid-cols-[repeat(5,minmax(0,1fr))_9.5rem] ${
                    elegidosW.length ? "border-bosque bg-bosque/5" : elegibles.length ? "border-linea bg-white" : "border-linea bg-crema opacity-70"
                  }`}
                >
                  {celdas}
                  <span className="col-span-5 flex items-center justify-between gap-3 px-1 pt-1 text-sm sm:col-span-1 sm:flex-col sm:items-end sm:gap-1 sm:pt-0">
                    {resumen}
                    {elegibles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => poner(elegibles, !todaLaSemana)}
                        className="text-xs font-semibold whitespace-nowrap text-bosque hover:underline"
                      >
                        {todaLaSemana ? "Quitar semana" : elegibles.length === dias.length ? "Semana completa" : "Días que quedan"}
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {semanas.length > 1 && disponibles.length > 0 && (
        <button
          type="button"
          onClick={() => poner(disponibles, !todas)}
          className="text-sm font-semibold text-bosque hover:underline"
        >
          {todas ? "Quitar todo" : conDias ? "Elegir todos los días disponibles" : "Elegir todas las semanas disponibles"}
        </button>
      )}
    </div>
  );
}
