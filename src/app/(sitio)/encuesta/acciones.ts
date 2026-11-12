"use server";

import { z } from "zod";
import { enviarAvisoEncuesta } from "@/lib/email";
import { DIAS_PREFERIDOS, EDADES_ENCUESTA, FRECUENCIAS, PREGUNTAS_ENCUESTA, type RespuestaEncuesta } from "@/lib/encuesta";
import { db } from "@/lib/firebase-admin";

const otroTexto = z.string().trim().max(200).default("");

const esquema = z.object({
  nombre: z.string().trim().max(80).default(""),
  edad: z
    .number()
    .int()
    .refine((e) => (EDADES_ENCUESTA as readonly number[]).includes(e), "Elige tu edad"),
  elegidas: z.record(z.string(), z.array(z.string().max(200)).max(30)),
  otros: z.record(z.string(), otroTexto),
  frecuencia: z.string().refine((f) => f === "" || FRECUENCIAS.includes(f), "Frecuencia inválida").default(""),
  dias: z.array(z.string()).max(DIAS_PREFERIDOS.length).default([]),
  comentario: z.string().trim().max(2000).default(""),
  /** Campo trampa: las personas no lo ven; si viene con algo, es un robot. */
  web: z.string().max(200).default(""),
});

export type DatosEncuesta = z.input<typeof esquema>;
export type ResultadoEncuesta = { ok: true } | { ok: false; error: string };

export async function enviarEncuesta(datos: DatosEncuesta): Promise<ResultadoEncuesta> {
  const r = esquema.safeParse(datos);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Revisa tus respuestas" };
  const d = r.data;
  // Al robot le decimos que salió bien, pero no se guarda nada.
  if (d.web) return { ok: true };

  // Solo se guardan opciones que existen, más el texto propio de "otro".
  const elegidas = {} as RespuestaEncuesta["elegidas"];
  const otros: RespuestaEncuesta["otros"] = {};
  for (const p of PREGUNTAS_ENCUESTA) {
    elegidas[p.id] = (d.elegidas[p.id] ?? []).filter((o) => p.opciones.includes(o));
    const otro = p.otro ? (d.otros[p.id] ?? "").trim() : "";
    if (otro) otros[p.id] = otro;
  }
  const dias = d.dias.filter((x) => DIAS_PREFERIDOS.includes(x));

  const marcadas = Object.values(elegidas).reduce((t, xs) => t + xs.length, 0) + Object.keys(otros).length;
  if (marcadas === 0 && !d.comentario) {
    return { ok: false, error: "Marca al menos una opción o cuéntanos algo al final." };
  }

  const respuesta: Omit<RespuestaEncuesta, "id"> = {
    nombre: d.nombre,
    edad: d.edad,
    elegidas,
    otros,
    frecuencia: d.frecuencia,
    dias,
    comentario: d.comentario,
    creadoEn: Date.now(),
  };

  try {
    const ref = await db.collection("encuestaJovenes").add(respuesta);
    // Si el correo falla, la respuesta igual queda guardada y se ve en el panel.
    await enviarAvisoEncuesta({ id: ref.id, ...respuesta }).catch((e) =>
      console.error("No se pudo enviar el aviso de la encuesta", e),
    );
  } catch (e) {
    console.error("No se pudo guardar la encuesta", e);
    return { ok: false, error: "No pudimos guardar tus respuestas. Intenta de nuevo en un rato." };
  }
  return { ok: true };
}
