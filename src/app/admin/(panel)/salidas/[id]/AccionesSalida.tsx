"use client";

import { useState, useTransition } from "react";
import { duplicarSalida, eliminarSalida } from "../../acciones";

export function AccionesSalida({ id }: { id: string }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState("");

  return (
    <section className="mt-10 rounded-2xl border border-linea p-6">
      <h2 className="font-semibold">Otras acciones</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pendiente}
          onClick={() => iniciar(() => duplicarSalida(id))}
          className="btn btn-secundario px-4 py-2 text-sm text-marca"
        >
          Duplicar para otra fecha
        </button>
        <button
          type="button"
          disabled={pendiente}
          onClick={() => {
            if (!confirm("¿Borrar esta salida? Esto no se puede deshacer.")) return;
            iniciar(async () => {
              const r = await eliminarSalida(id);
              if (r?.error) setError(r.error);
            });
          }}
          className="btn px-4 py-2 text-sm text-acento hover:bg-acento/10"
        >
          Borrar salida
        </button>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-acento">{error}</p>}
    </section>
  );
}
