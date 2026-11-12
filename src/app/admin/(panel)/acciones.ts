"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cerrarSesion, requerirAdmin } from "@/lib/auth";
import { aSalida } from "@/lib/data";
import { MAX_FOTOS_SALIDA } from "@/lib/salida-utils";
import { db } from "@/lib/firebase-admin";
import { borrarImagen, copiarImagen, subirImagen } from "@/lib/storage";
import type { FotoSalida, Semana } from "@/lib/types";

export type EstadoFormulario = { error?: string; ok?: string } | null;

const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");
const hora = z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida");

const esquemaSalida = z
  .object({
    titulo: z.string().trim().min(3, "Escribe un nombre para la salida").max(120),
    fecha,
    fechaFin: z.union([fecha, z.literal("")]),
    horaInicio: hora,
    horaFin: hora,
    lugar: z.string().trim().min(2, "Indica el lugar").max(160),
    puntoEncuentro: z.string().trim().max(240),
    edadMin: z.coerce.number().int().min(1).max(18),
    edadMax: z.coerce.number().int().min(1).max(18),
    precio: z.coerce.number().int("El precio va sin decimales").min(0).max(10_000_000),
    cupos: z.coerce.number().int().min(1, "Debe haber al menos 1 cupo").max(500),
    precioDia: z
      .union([z.literal(""), z.coerce.number().int("El precio por día va sin decimales").min(0).max(10_000_000)])
      .optional(),
    descripcion: z.string().trim().max(2000),
    queLlevar: z.string().max(3000),
    estado: z.enum(["publicada", "borrador", "cerrada"]),
  })
  .refine((s) => s.edadMin <= s.edadMax, { message: "La edad mínima no puede ser mayor que la máxima" })
  .refine((s) => !s.fechaFin || s.fechaFin >= s.fecha, { message: "La fecha de término es anterior al inicio" });

const esquemaSemanas = z
  .array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]{1,40}$/),
      inicio: fecha,
      fin: fecha,
      precio: z.number().int("El precio va sin decimales").min(0).max(10_000_000),
      cupos: z.number().int().min(1, "Cada semana debe tener al menos 1 cupo").max(500),
    }),
  )
  .max(30, "Máximo 30 semanas")
  .refine((ws) => ws.every((w) => w.fin >= w.inicio), { message: "Hay una semana que termina antes de empezar" })
  .refine((ws) => new Set(ws.map((w) => w.id)).size === ws.length, { message: "Semanas repetidas" })
  .refine(
    (ws) => {
      const orden = [...ws].sort((a, b) => a.inicio.localeCompare(b.inicio));
      return orden.every((w, i) => i === 0 || w.inicio > orden[i - 1].fin);
    },
    { message: "Hay semanas que se cruzan entre sí" },
  );

/** Lee las semanas del formulario (JSON). Sin semanas = salida normal. */
function leerSemanas(form: FormData): { semanas: Omit<Semana, "cuposTomados">[] } | { error: string } {
  const crudo = String(form.get("semanas") ?? "");
  if (!crudo) return { semanas: [] };
  let json: unknown;
  try {
    json = JSON.parse(crudo);
  } catch {
    return { error: "No se pudieron leer las semanas" };
  }
  const r = esquemaSemanas.safeParse(json);
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa las semanas" };
  return { semanas: [...r.data].sort((a, b) => a.inicio.localeCompare(b.inicio)) };
}

/** Campos de la salida que salen de sus semanas: fechas, precio "desde" y cupos totales. */
function resumenSemanas(semanas: Semana[]) {
  return {
    semanas,
    fecha: semanas[0].inicio,
    fechaFin: semanas[semanas.length - 1].fin,
    precio: Math.min(...semanas.map((w) => w.precio)),
    cupos: semanas.reduce((t, w) => t + w.cupos, 0),
  };
}

function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

async function idDisponible(base: string): Promise<string> {
  let id = base;
  for (let i = 2; (await db.collection("salidas").doc(id).get()).exists; i++) id = `${base}-${i}`;
  return id;
}

function refrescarSitio(id?: string) {
  revalidatePath("/");
  if (id) revalidatePath(`/salidas/${id}`);
  revalidatePath("/admin");
}

export async function guardarSalida(_: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const id = String(form.get("id") ?? "");
  const r = esquemaSalida.safeParse(Object.fromEntries(form));
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos" };
  const s = r.data;
  const leidas = leerSemanas(form);
  if ("error" in leidas) return { error: leidas.error };
  if (form.get("porSemanas") === "1" && s.fechaFin && !leidas.semanas.length) {
    return { error: "Agrega al menos una semana, o desmarca la inscripción por semanas." };
  }
  const datos = {
    ...s,
    fechaFin: s.fechaFin || null,
    semanas: [] as Semana[],
    precioDia: leidas.semanas.length && s.precioDia ? s.precioDia : null,
    queLlevar: s.queLlevar
      .split("\n")
      .map((x) => x.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean),
    actualizadoEn: Date.now(),
  };

  if (id) {
    const ref = db.collection("salidas").doc(id);
    const error = await db.runTransaction(async (tx) => {
      const actual = await tx.get(ref);
      if (!actual.exists) return "La salida ya no existe";
      const previa = aSalida(actual);
      if (leidas.semanas.length || previa.semanas.length) {
        // Los cupos tomados de cada semana los lleva el servidor; del formulario solo vienen fechas, precio y cupos.
        const antes = new Map(previa.semanas.map((w) => [w.id, w]));
        if (!previa.semanas.length && previa.cuposTomados > 0) {
          return "Esta salida ya tiene inscritos, así que no se puede pasar a inscripción por semanas.";
        }
        const movida = leidas.semanas.find((w) => {
          const previaW = antes.get(w.id);
          return previaW && previaW.cuposTomados > 0 && (previaW.inicio !== w.inicio || previaW.fin !== w.fin);
        });
        if (movida) return `La semana que partía el ${antes.get(movida.id)!.inicio} tiene inscritos, así que no se le pueden cambiar las fechas.`;
        const semanas: Semana[] = leidas.semanas.map((w) => {
          const previaW = antes.get(w.id);
          return {
            ...w,
            cuposTomados: previaW?.cuposTomados ?? 0,
            ...(previaW?.tomadosDia ? { tomadosDia: previaW.tomadosDia } : {}),
          };
        });
        const sobra = semanas.find((w) => w.cupos < w.cuposTomados);
        if (sobra) return `La semana que parte el ${sobra.inicio} ya tiene ${sobra.cuposTomados} inscritos: no puedes dejarle menos cupos.`;
        const quitada = previa.semanas.find((w) => w.cuposTomados > 0 && !semanas.some((n) => n.id === w.id));
        if (quitada) return `La semana que parte el ${quitada.inicio} tiene inscritos, así que no se puede quitar.`;
        if (semanas.length) Object.assign(datos, resumenSemanas(semanas));
        tx.update(ref, { ...datos, cuposTomados: semanas.reduce((t, w) => t + w.cuposTomados, 0) });
        return null;
      }
      const tomados = previa.cuposTomados;
      if (datos.cupos < tomados) return `Ya hay ${tomados} cupos tomados: no puedes dejar menos que eso.`;
      tx.update(ref, datos);
      return null;
    });
    if (error) return { error };
    refrescarSitio(id);
    return { ok: "Cambios guardados" };
  }

  if (leidas.semanas.length) Object.assign(datos, resumenSemanas(leidas.semanas.map((w) => ({ ...w, cuposTomados: 0 }))));
  const nuevo = await idDisponible(`${slug(datos.titulo)}-${datos.fecha}`);
  await db
    .collection("salidas")
    .doc(nuevo)
    .set({ ...datos, cuposTomados: 0, fotos: [], fotoUrl: null, fotoPath: null, creadoEn: Date.now() });
  refrescarSitio(nuevo);
  redirect(`/admin/salidas/${nuevo}?creada=1`);
}

export async function duplicarSalida(id: string): Promise<void> {
  await requerirAdmin();
  const d = await db.collection("salidas").doc(id).get();
  if (!d.exists) redirect("/admin");
  const s = aSalida(d);
  const nuevo = await idDisponible(`${slug(s.titulo)}-copia`);
  const { id: _id, ...resto } = s;
  void _id;
  // Cada salida tiene sus propias copias de las fotos, así borrar una no afecta a la otra.
  const fotos = await Promise.all(
    s.fotos.map(async (f) => ({ ...f, ...(await copiarImagen(f.path, `salidas/${nuevo}`)) })),
  );
  await db
    .collection("salidas")
    .doc(nuevo)
    .set({
      ...resto,
      ...conPortada(fotos),
      titulo: `${s.titulo} (copia)`,
      estado: "borrador",
      cuposTomados: 0,
      semanas: s.semanas.map((w) => ({ ...w, cuposTomados: 0, tomadosDia: {} })),
      creadoEn: Date.now(),
      actualizadoEn: Date.now(),
    });
  refrescarSitio();
  redirect(`/admin/salidas/${nuevo}`);
}

export async function eliminarSalida(id: string): Promise<EstadoFormulario> {
  await requerirAdmin();
  const insc = await db.collection("inscripciones").where("salidaId", "==", id).limit(1).get();
  if (!insc.empty) {
    return { error: "Esta salida tiene inscripciones, así que no se puede borrar. Puedes cerrarla o dejarla como borrador." };
  }
  const d = await db.collection("salidas").doc(id).get();
  await db.collection("salidas").doc(id).delete();
  if (d.exists) await Promise.all(aSalida(d).fotos.map((f) => borrarImagen(f.path)));
  refrescarSitio(id);
  redirect("/admin?borrada=1");
}

/* ───────────── Fotos de cada salida ───────────── */


/** Campos a guardar cuando cambia la lista de fotos (la portada es la primera). */
function conPortada(fotos: FotoSalida[]) {
  return { fotos, fotoUrl: fotos[0]?.url ?? null, fotoPath: fotos[0]?.path ?? null };
}

/** Lee la salida, aplica un cambio a su lista de fotos y la guarda, todo en una transacción. */
async function cambiarFotos(
  id: string,
  cambio: (fotos: FotoSalida[]) => FotoSalida[] | string,
): Promise<EstadoFormulario & { fotos?: FotoSalida[] }> {
  const ref = db.collection("salidas").doc(id);
  const r = await db.runTransaction(async (tx) => {
    const d = await tx.get(ref);
    if (!d.exists) return "La salida ya no existe";
    const nuevas = cambio([...aSalida(d).fotos]);
    if (typeof nuevas === "string") return nuevas;
    tx.update(ref, { ...conPortada(nuevas), actualizadoEn: Date.now() });
    return nuevas;
  });
  if (typeof r === "string") return { error: r };
  refrescarSitio(id);
  return { fotos: r };
}

/** Sube una foto (el navegador las manda de a una, ya achicadas). */
export async function subirFotoSalida(id: string, form: FormData): Promise<EstadoFormulario & { fotos?: FotoSalida[] }> {
  await requerirAdmin();
  const archivo = form.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "No llegó ninguna foto" };
  const actual = await db.collection("salidas").doc(id).get();
  if (!actual.exists) return { error: "La salida ya no existe" };
  if (aSalida(actual).fotos.length >= MAX_FOTOS_SALIDA) {
    return { error: `Cada salida puede tener hasta ${MAX_FOTOS_SALIDA} fotos.` };
  }

  let subida: { url: string; path: string };
  try {
    subida = await subirImagen(archivo, `salidas/${id}`);
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "";
    // Errores de validación nuestros (tipo o peso): se muestran tal cual.
    if (mensaje.startsWith("La foto")) return { error: mensaje };
    console.error("Error al subir foto de salida", e);
    if (/bucket does not exist|notFound/i.test(mensaje)) {
      return {
        error:
          "El almacenamiento de fotos todavía no está activado en Firebase (Storage). Hay que activarlo para poder subir fotos.",
      };
    }
    return { error: "No se pudo subir la foto. Inténtalo de nuevo en un rato." };
  }
  const r = await cambiarFotos(id, (fotos) =>
    fotos.length >= MAX_FOTOS_SALIDA
      ? `Cada salida puede tener hasta ${MAX_FOTOS_SALIDA} fotos.`
      : [...fotos, { ...subida, alt: "" }],
  );
  if (r.error) await borrarImagen(subida.path);
  return r;
}

export async function borrarFotoSalida(id: string, path: string) {
  await requerirAdmin();
  const r = await cambiarFotos(id, (fotos) => fotos.filter((f) => f.path !== path));
  if (!r.error) await borrarImagen(path);
  return r;
}

/** Mueve una foto a otra posición (0 = portada). */
export async function moverFotoSalida(id: string, path: string, posicion: number) {
  await requerirAdmin();
  return cambiarFotos(id, (fotos) => {
    const i = fotos.findIndex((f) => f.path === path);
    if (i < 0) return "Esa foto ya no está";
    const [foto] = fotos.splice(i, 1);
    fotos.splice(Math.max(0, Math.min(posicion, fotos.length)), 0, foto);
    return fotos;
  });
}

export async function describirFotoSalida(id: string, path: string, alt: string) {
  await requerirAdmin();
  const texto = alt.trim().slice(0, 200);
  return cambiarFotos(id, (fotos) => fotos.map((f) => (f.path === path ? { ...f, alt: texto } : f)));
}

const esquemaAjustes = z.object({
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || (v.length >= 8 && v.length <= 15), "El WhatsApp debe tener entre 8 y 15 dígitos, con código de país (56…)"),
  email: z.union([z.literal(""), z.string().trim().email("El correo no es válido")]),
  instagram: z
    .string()
    .trim()
    .max(31)
    .transform((v) => v.replace(/^@/, "")),
  textoAutorizacion: z.string().trim().min(20, "El texto de autorización es muy corto").max(5000),
});

export async function guardarAjustes(_: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const r = esquemaAjustes.safeParse(Object.fromEntries(form));
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos" };
  await db.collection("ajustes").doc("sitio").set(r.data, { merge: true });
  revalidatePath("/", "layout");
  return { ok: "Ajustes guardados" };
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/admin/login");
}

export async function borrarRespuestaEncuesta(id: string): Promise<void> {
  await requerirAdmin();
  if (!id || id.includes("/")) return;
  await db.collection("encuestaJovenes").doc(id).delete();
  revalidatePath("/admin/encuesta");
}
