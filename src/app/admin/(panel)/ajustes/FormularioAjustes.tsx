"use client";

import { useActionState } from "react";
import type { AjustesSitio } from "@/lib/types";
import { guardarAjustes } from "../acciones";

export function FormularioAjustes({ ajustes }: { ajustes: AjustesSitio }) {
  const [estado, accion, guardando] = useActionState(guardarAjustes, null);
  return (
    <form action={accion} className="space-y-6">
      <section className="space-y-4 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">Contacto</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="rotulo">WhatsApp</span>
            <input name="whatsapp" defaultValue={ajustes.whatsapp} placeholder="56912345678" inputMode="tel" className="campo" />
            <span className="mt-1 block text-xs text-gris">Con código de país, sin + ni espacios.</span>
          </label>
          <label className="block">
            <span className="rotulo">Correo</span>
            <input name="email" type="email" defaultValue={ajustes.email} className="campo" />
            <span className="mt-1 block text-xs text-gris">Aquí llegan los avisos de inscripción.</span>
          </label>
          <label className="block">
            <span className="rotulo">Instagram</span>
            <input name="instagram" defaultValue={ajustes.instagram} placeholder="clubdelamontanachile" className="campo" />
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold">Autorización del apoderado</h2>
        <p className="text-sm text-gris">El apoderado debe aceptar este texto para poder inscribir.</p>
        <textarea name="textoAutorizacion" rows={8} required defaultValue={ajustes.textoAutorizacion} className="campo" />
      </section>

      <div className="flex flex-wrap items-center justify-end gap-4">
        {estado?.error && (
          <p role="alert" className="mr-auto rounded-xl bg-acento/10 px-4 py-2 text-sm font-medium text-acento">
            {estado.error}
          </p>
        )}
        {estado?.ok && <p className="mr-auto rounded-xl bg-bosque/15 px-4 py-2 text-sm font-medium text-bosque">{estado.ok}</p>}
        <button type="submit" disabled={guardando} className="btn btn-primario">
          {guardando ? "Guardando…" : "Guardar ajustes"}
        </button>
      </div>
    </form>
  );
}
