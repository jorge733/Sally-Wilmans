"use server";

import { z } from "zod";
import { enviarAvisoEncuesta } from "@/lib/email";
import {
  CON_AMIGOS,
  EDADES_ENCUESTA,
  estadoEncuesta,
  PREGUNTAS_ENCUESTA,
  VINO_ANTES,
  type RespuestaEncuesta,
} from "@/lib/encuesta";
import { db } from "@/lib/firebase-admin";
import { hoyChile } from "@/lib/format";

const textoLibre = (max: number) => z.string().trim().max(max).default("");
const unaDe = (lista: string[]) => z.string().refine((v) => v === "" || lista.includes(v)).default("");

const esquema = z.object({
  nombre: textoLibre(80),
  edad: z
    .number()
    .int()
    .refine((e) => (EDADES_ENCUESTA as readonly number[]).includes(e), "Elige tu edad"),
  vinoAntes: unaDe(VINO_ANTES),
  conAmigos: unaDe(CON_AMIGOS),
  elegidas: z.record(z.string(), z.array(z.string().max(200)).max(30)),
  otros: z.record(z.string(), textoLibre(200)),
  noMeGustaria: textoLibre(1000),
  nombreGrupo: textoLibre(80),
  comentario: textoLibre(2000),
  contactoApoderado: textoLibre(120),
  /** Campo trampa: las personas no lo ven; si viene con algo, es un robot. */
  web: z.string().max(200).default(""),
});

export type DatosEncuesta = z.input<typeof esquema>;
export type ResultadoEncuesta = { ok: true } | { ok: false; error: string };

export async function enviarEncuesta(datos: DatosEncuesta): Promise<ResultadoEncuesta> {
  const estado = estadoEncuesta(hoyChile());
  if (estado === "pronto") return { ok: false, error: "La encuesta todavía no está abierta." };
  if (estado === "cerrada") return { ok: false, error: "La encuesta ya cerró. ¡Gracias por tu interés!" };

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

  const marcadas = Object.values(elegidas).reduce((t, xs) => t + xs.length, 0) + Object.keys(otros).length;
  if (marcadas === 0 && !d.comentario && !d.noMeGustaria) {
    return { ok: false, error: "Marca al menos una opción o cuéntanos algo al final." };
  }

  const respuesta: Omit<RespuestaEncuesta, "id"> = {
    nombre: d.nombre,
    edad: d.edad,
    vinoAntes: d.vinoAntes,
    conAmigos: d.conAmigos,
    elegidas,
    otros,
    noMeGustaria: d.noMeGustaria,
    nombreGrupo: d.nombreGrupo,
    comentario: d.comentario,
    contactoApoderado: d.contactoApoderado,
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
