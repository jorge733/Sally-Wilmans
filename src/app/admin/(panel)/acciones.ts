"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cerrarSesion, requerirAdmin } from "@/lib/auth";
import { aSalida } from "@/lib/data";
import { db } from "@/lib/firebase-admin";

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
    descripcion: z.string().trim().max(2000),
    queLlevar: z.string().max(3000),
    estado: z.enum(["publicada", "borrador", "cerrada"]),
  })
  .refine((s) => s.edadMin <= s.edadMax, { message: "La edad mínima no puede ser mayor que la máxima" })
  .refine((s) => !s.fechaFin || s.fechaFin >= s.fecha, { message: "La fecha de término es anterior al inicio" });

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
  const datos = {
    ...s,
    fechaFin: s.fechaFin || null,
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
      const tomados = aSalida(actual).cuposTomados;
      if (datos.cupos < tomados) return `Ya hay ${tomados} cupos tomados: no puedes dejar menos que eso.`;
      tx.update(ref, datos);
      return null;
    });
    if (error) return { error };
    refrescarSitio(id);
    return { ok: "Cambios guardados" };
  }

  const nuevo = await idDisponible(`${slug(s.titulo)}-${s.fecha}`);
  await db
    .collection("salidas")
    .doc(nuevo)
    .set({ ...datos, cuposTomados: 0, fotoUrl: null, fotoPath: null, creadoEn: Date.now() });
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
  await db
    .collection("salidas")
    .doc(nuevo)
    .set({
      ...resto,
      titulo: `${s.titulo} (copia)`,
      estado: "borrador",
      cuposTomados: 0,
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
  await db.collection("salidas").doc(id).delete();
  refrescarSitio(id);
  redirect("/admin?borrada=1");
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
