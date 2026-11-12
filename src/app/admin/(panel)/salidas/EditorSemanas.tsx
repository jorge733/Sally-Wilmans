"use client";

import { clp, diasHabiles, rangoDias, sumarDias } from "@/lib/format";
import type { Semana } from "@/lib/types";

export type FilaSemana = Omit<Semana, "precio" | "cupos"> & { precio: string; cupos: string };

const nuevoId = () => Math.random().toString(36).slice(2, 10);

/** Bloques de lunes a viernes entre dos fechas (el primero y el último pueden quedar cortos). */
export function armarSemanas(desde: string, hasta: string, precio: string, cupos: string): FilaSemana[] {
  const filas: FilaSemana[] = [];
  let f = desde;
  // Si parte en fin de semana, se salta al lunes.
  while (f <= hasta && [0, 6].includes(new Date(`${f}T12:00:00Z`).getUTCDay())) f = sumarDias(f, 1);
  while (f <= hasta) {
    const dia = new Date(`${f}T12:00:00Z`).getUTCDay(); // 1 = lunes
    const viernes = sumarDias(f, 5 - dia);
    const fin = viernes < hasta ? viernes : hasta;
    filas.push({ id: nuevoId(), inicio: f, fin, precio, cupos, cuposTomados: 0 });
    f = sumarDias(viernes, 3);
  }
  return filas;
}

export function EditorSemanas({
  filas,
  cambiar,
  desde,
  hasta,
  precioBase,
  cuposBase,
}: {
  filas: FilaSemana[];
  cambiar: (f: FilaSemana[]) => void;
  desde: string;
  hasta: string;
  precioBase: string;
  cuposBase: string;
}) {
  const editar = (i: number, campo: keyof FilaSemana, valor: string) =>
    cambiar(filas.map((w, j) => (j === i ? { ...w, [campo]: valor } : w)));

  const ultima = filas[filas.length - 1];
  const agregar = () => {
    const inicio = ultima ? sumarDias(ultima.inicio, 7) : desde;
    cambiar([
      ...filas,
      {
        id: nuevoId(),
        inicio,
        fin: sumarDias(inicio, 4),
        precio: ultima?.precio ?? precioBase,
        cupos: ultima?.cupos ?? cuposBase,
        cuposTomados: 0,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {filas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-linea p-5 text-sm text-gris">
          <p>Todavía no hay semanas.</p>
          <button
            type="button"
            disabled={!desde || !hasta || hasta < desde}
            onClick={() => cambiar(armarSemanas(desde, hasta, precioBase, cuposBase))}
            className="btn btn-secundario mt-3 px-4 py-2 text-sm text-marca disabled:opacity-50"
          >
            Armar semanas de lunes a viernes {desde && hasta && hasta >= desde ? `(${rangoDias(desde, hasta)})` : ""}
          </button>
          {(!desde || !hasta) && <p className="mt-2 text-xs">Primero pon las fechas «Desde» y «Hasta».</p>}
        </div>
      ) : (
        <ul className="space-y-2">
          {filas.map((w, i) => {
            const valida = w.inicio && w.fin && w.fin >= w.inicio;
            return (
              <li key={w.id} className="rounded-xl border border-linea p-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1fr_90px_auto] sm:items-end">
                  <label className="block">
                    <span className="rotulo">Desde</span>
                    <input type="date" required value={w.inicio} onChange={(e) => editar(i, "inicio", e.target.value)} className="campo" />
                  </label>
                  <label className="block">
                    <span className="rotulo">Hasta</span>
                    <input type="date" required value={w.fin} min={w.inicio} onChange={(e) => editar(i, "fin", e.target.value)} className="campo" />
                  </label>
                  <label className="block">
                    <span className="rotulo">Precio semana</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={w.precio}
                      onChange={(e) => editar(i, "precio", e.target.value)}
                      className="campo"
                    />
                  </label>
                  <label className="block">
                    <span className="rotulo">Cupos por día</span>
                    <input
                      type="number"
                      required
                      min={Math.max(1, w.cuposTomados)}
                      value={w.cupos}
                      onChange={(e) => editar(i, "cupos", e.target.value)}
                      className="campo"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={w.cuposTomados > 0}
                    title={w.cuposTomados > 0 ? "Tiene inscritos: no se puede quitar" : "Quitar semana"}
                    onClick={() => cambiar(filas.filter((_, j) => j !== i))}
                    className="col-span-2 justify-self-start py-2 text-sm text-gris hover:text-acento disabled:opacity-40 sm:col-span-1"
                  >
                    Quitar
                  </button>
                </div>
                <p className="mt-2 text-xs text-gris">
                  {valida ? `${rangoDias(w.inicio, w.fin)} · ${diasHabiles(w.inicio, w.fin)} días` : "Revisa las fechas"}
                  {w.precio !== "" && ` · ${clp(Number(w.precio))}`}
                  {w.cuposTomados > 0 && ` · ${w.cuposTomados} ya inscritos`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      {filas.length > 0 && (
        <button type="button" onClick={agregar} className="text-sm font-semibold text-bosque hover:underline">
          + Agregar semana
        </button>
      )}
    </div>
  );
}
