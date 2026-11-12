"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import {
  completarFotos,
  FORMATOS,
  MAX_FOTOS_GALERIA,
  type Formato,
  type FotoSitio,
  type FotosSitio,
  type LugarFoto,
} from "@/lib/fotos-sitio";
import { borrarImagen, subirImagen } from "@/lib/storage";

export type RespuestaFotos = { error?: string; fotos?: FotosSitio };

const ref = () => db.collection("ajustes").doc("fotos");
const LUGARES: LugarFoto[] = ["portada", "nosotros", "galeria"];

/**
 * Lee las fotos, aplica un cambio y las guarda, en una transacción.
 * El cambio devuelve las fotos nuevas y las rutas de Storage que quedaron sin uso (o un error).
 */
async function cambiar(cambio: (f: FotosSitio) => { fotos: FotosSitio; sobran?: (string | undefined)[] } | string): Promise<RespuestaFotos> {
  const r = await db.runTransaction(async (tx) => {
    const d = await tx.get(ref());
    const res = cambio(completarFotos(d.data() as Partial<FotosSitio> | undefined));
    if (typeof res === "string") return res;
    tx.set(ref(), { ...res.fotos, actualizadoEn: Date.now() });
    return res;
  });
  if (typeof r === "string") return { error: r };
  await Promise.all((r.sobran ?? []).map((p) => borrarImagen(p)));
  revalidatePath("/");
  return { fotos: r.fotos };
}

/** Sube una foto (ya achicada en el navegador): reemplaza la portada o la de «Quiénes somos», o se suma a la galería. */
export async function subirFotoSitio(lugar: LugarFoto, form: FormData): Promise<RespuestaFotos> {
  await requerirAdmin();
  if (!LUGARES.includes(lugar)) return { error: "Lugar desconocido" };
  const archivo = form.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "No llegó ninguna foto" };

  let subida: { url: string; path: string };
  try {
    subida = await subirImagen(archivo, "sitio");
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "";
    if (mensaje.startsWith("La foto")) return { error: mensaje };
    console.error("Error al subir foto del sitio", e);
    if (/bucket does not exist|notFound/i.test(mensaje)) {
      return { error: "El almacenamiento de fotos todavía no está activado en Firebase (Storage)." };
    }
    return { error: "No se pudo subir la foto. Inténtalo de nuevo en un rato." };
  }

  const nueva: FotoSitio = { id: crypto.randomBytes(5).toString("hex"), ...subida, alt: "" };
  const r = await cambiar((f) => {
    if (lugar === "galeria") {
      if (f.galeria.length >= MAX_FOTOS_GALERIA) return `La galería puede tener hasta ${MAX_FOTOS_GALERIA} fotos.`;
      return { fotos: { ...f, galeria: [...f.galeria, { ...nueva, formato: "normal" }] } };
    }
    // Se mantiene la descripción anterior para no dejar la foto sin texto alternativo.
    return { fotos: { ...f, [lugar]: { ...nueva, alt: f[lugar].alt } }, sobran: [f[lugar].path] };
  });
  if (r.error) await borrarImagen(subida.path);
  return r;
}

/** Cambia la descripción o el formato de una foto. En portada y nosotros `id` se ignora. */
export async function editarFotoSitio(
  lugar: LugarFoto,
  id: string,
  cambios: { alt?: string; formato?: Formato },
): Promise<RespuestaFotos> {
  await requerirAdmin();
  const alt = cambios.alt === undefined ? undefined : String(cambios.alt).trim().slice(0, 200);
  const formato = cambios.formato && FORMATOS.includes(cambios.formato) ? cambios.formato : undefined;
  const aplicar = <T extends FotoSitio>(x: T): T => ({ ...x, ...(alt !== undefined && { alt }), ...(formato && { formato }) });
  return cambiar((f) => {
    if (lugar === "galeria") {
      if (!f.galeria.some((x) => x.id === id)) return "Esa foto ya no está";
      return { fotos: { ...f, galeria: f.galeria.map((x) => (x.id === id ? aplicar(x) : x)) } };
    }
    if (!LUGARES.includes(lugar)) return "Lugar desconocido";
    return { fotos: { ...f, [lugar]: { ...f[lugar], ...(alt !== undefined && { alt }) } } };
  });
}

/** Mueve una foto de la galería a otra posición. */
export async function moverFotoGaleria(id: string, posicion: number): Promise<RespuestaFotos> {
  await requerirAdmin();
  return cambiar((f) => {
    const lista = [...f.galeria];
    const i = lista.findIndex((x) => x.id === id);
    if (i < 0) return "Esa foto ya no está";
    const [x] = lista.splice(i, 1);
    lista.splice(Math.max(0, Math.min(Math.trunc(posicion), lista.length)), 0, x);
    return { fotos: { ...f, galeria: lista } };
  });
}

/** Quita una foto de la galería. */
export async function quitarFotoGaleria(id: string): Promise<RespuestaFotos> {
  await requerirAdmin();
  return cambiar((f) => {
    const x = f.galeria.find((y) => y.id === id);
    if (!x) return "Esa foto ya no está";
    return { fotos: { ...f, galeria: f.galeria.filter((y) => y.id !== id) }, sobran: [x.path] };
  });
}

/** Vuelve a la foto original del sitio (portada, nosotros) o a la galería original. */
export async function restablecerFotoSitio(lugar: LugarFoto): Promise<RespuestaFotos> {
  await requerirAdmin();
  if (!LUGARES.includes(lugar)) return { error: "Lugar desconocido" };
  const original = completarFotos(undefined);
  return cambiar((f) => {
    if (lugar === "galeria") {
      return { fotos: { ...f, galeria: original.galeria }, sobran: f.galeria.map((x) => x.path) };
    }
    return { fotos: { ...f, [lugar]: original[lugar] }, sobran: [f[lugar].path] };
  });
}
