"use client";

import { useTransition } from "react";
import { borrarRespuestaEncuesta } from "../acciones";

export function BotonBorrar({ id }: { id: string }) {
  const [pendiente, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={pendiente}
      onClick={() => {
        if (confirm("¿Borrar esta respuesta? No se puede deshacer.")) iniciar(() => borrarRespuestaEncuesta(id));
      }}
      className="text-sm text-gris hover:text-acento disabled:opacity-50"
    >
      {pendiente ? "Borrando…" : "Borrar"}
    </button>
  );
}
