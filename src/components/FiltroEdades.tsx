"use client";

import { useState } from "react";

export type GrupoEdad = { clave: string; texto: string };

/**
 * Botones para ver solo las salidas de un grupo de edad. Cada grupo es un rango de edades
 * que tiene alguna salida (ej. «5 a 12 años», «13 a 16 años»). Sin JavaScript se ven todas.
 */
export function FiltroEdades({
  grupos,
  salidas,
}: {
  grupos: GrupoEdad[];
  salidas: { id: string; grupo: string; tarjeta: React.ReactNode }[];
}) {
  const [elegido, setElegido] = useState<string | null>(null);
  const opciones: (GrupoEdad | null)[] = [null, ...grupos];

  return (
    <>
      {grupos.length > 1 && (
        <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar salidas por edad">
          <span className="mr-1 text-sm font-medium text-gris">Edad:</span>
          {opciones.map((g) => {
            const activo = (g?.clave ?? null) === elegido;
            return (
              <button
                key={g?.clave ?? "todas"}
                type="button"
                aria-pressed={activo}
                onClick={() => setElegido(g?.clave ?? null)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  activo
                    ? "border-bosque bg-bosque text-white"
                    : "border-linea bg-white text-tinta hover:border-bosque/60"
                }`}
              >
                {g ? g.texto : "Todas"}
              </button>
            );
          })}
        </div>
      )}
      <div className={`${grupos.length > 1 ? "mt-6" : "mt-10"} grid gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
        {salidas.map((s) => (
          <div key={s.id} hidden={elegido !== null && s.grupo !== elegido} className="flex [&>*]:w-full">
            {s.tarjeta}
          </div>
        ))}
      </div>
    </>
  );
}
