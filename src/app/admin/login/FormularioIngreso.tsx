"use client";

import { useActionState } from "react";
import { ingresar } from "./acciones";

export function FormularioIngreso() {
  const [estado, accion, enviando] = useActionState(ingresar, null);
  return (
    <form action={accion} className="mt-6 space-y-4">
      <label className="block">
        <span className="rotulo">Clave</span>
        <input name="clave" type="password" required autoFocus autoComplete="current-password" className="campo" />
      </label>
      {estado?.error && (
        <p role="alert" className="rounded-xl bg-acento/10 px-4 py-2.5 text-sm font-medium text-acento">
          {estado.error}
        </p>
      )}
      <button type="submit" disabled={enviando} className="btn btn-primario w-full">
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
