"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requerirAdmin } from "@/lib/auth";
import { fotosDelCuerpo, MAX_CUERPO, MAX_RESUMEN, MAX_TITULO, type ImagenArticulo } from "@/lib/blog";
import { aArticulo } from "@/lib/data";
import { db } from "@/lib/firebase-admin";
import { borrarImagen, subirImagen } from "@/lib/storage";
import type { EstadoFormulario } from "../acciones";

const CARPETA = "blog";
/** Solo se aceptan (y se borran) fotos de la carpeta del blog. */
const pathValido = (p: string) => p.startsWith(`public/${CARPETA}/`) && !p.includes("..");

const imagen = z.object({ url: z.string().url().max(1000), path: z.string().max(300).refine(pathValido) });

const esquemaArticulo = z.object({
  titulo: z.string().trim().min(3, "Escribe un título").max(MAX_TITULO, `El título tiene más de ${MAX_TITULO} letras`),
  resumen: z.string().trim().max(MAX_RESUMEN, `El resumen tiene más de ${MAX_RESUMEN} letras`),
  cuerpo: z.string().trim().min(1, "El artículo no tiene texto").max(MAX_CUERPO, "El artículo es demasiado largo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  estado: z.enum(["publicado", "borrador"]),
  portada: imagen.extend({ alt: z.string().trim().max(200) }).nullable(),
  /** Todas las fotos que el editor subió o tenía; las que ya no se usan se borran */
  subidas: z.array(imagen).max(200),
});

function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
}

async function idDisponible(base: string): Promise<string> {
  const limpio = base || "articulo";
  let id = limpio;
  for (let i = 2; (await db.collection(CARPETA).doc(id).get()).exists; i++) id = `${limpio}-${i}`;
  return id;
}

function refrescar(id?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  if (id) revalidatePath(`/blog/${id}`);
  revalidatePath("/admin/blog");
}

export async function guardarArticulo(_: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  let datos: unknown;
  try {
    datos = JSON.parse(String(form.get("articulo") ?? ""));
  } catch {
    return { error: "No se pudo leer el artículo. Recarga la página e intenta de nuevo." };
  }
  const r = esquemaArticulo.safeParse(datos);
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos" };
  const { subidas, ...a } = r.data;
  const id = String(form.get("id") ?? "");

  const ref = id ? db.collection(CARPETA).doc(id) : null;
  const previo = ref ? await ref.get() : null;
  if (ref && !previo?.exists) return { error: "El artículo ya no existe" };
  const anterior = previo ? aArticulo(previo) : null;

  // Fotos: se guardan las que siguen en el texto; las demás (reemplazadas o quitadas) se borran.
  const enTexto = new Set(fotosDelCuerpo(a.cuerpo));
  const conocidas = new Map<string, ImagenArticulo>();
  for (const f of [...(anterior?.imagenes ?? []), ...subidas]) conocidas.set(f.path, { url: f.url, path: f.path });
  if (anterior?.portada) conocidas.set(anterior.portada.path, anterior.portada);
  const imagenes = [...conocidas.values()].filter((f) => enTexto.has(f.url) && f.path !== a.portada?.path);
  const sobran = [...conocidas.values()].filter(
    (f) => f.path !== a.portada?.path && !imagenes.some((g) => g.path === f.path),
  );

  const guardar = { ...a, imagenes, actualizadoEn: Date.now() };
  let destino = id;
  if (ref) {
    await ref.update(guardar);
  } else {
    destino = await idDisponible(slug(a.titulo));
    await db.collection(CARPETA).doc(destino).set({ ...guardar, creadoEn: Date.now() });
  }
  await Promise.all(sobran.filter((f) => pathValido(f.path)).map((f) => borrarImagen(f.path)));
  refrescar(destino);
  if (!id) redirect(`/admin/blog/${destino}?creado=1`);
  return {
    ok: a.estado === "publicado" ? "Cambios guardados. Ya se ven en el sitio." : "Cambios guardados como borrador.",
  };
}

export async function eliminarArticulo(id: string): Promise<void> {
  await requerirAdmin();
  if (!id || id.includes("/")) return;
  const d = await db.collection(CARPETA).doc(id).get();
  if (d.exists) {
    const a = aArticulo(d);
    await db.collection(CARPETA).doc(id).delete();
    const fotos = [...a.imagenes.map((f) => f.path), a.portada?.path ?? ""].filter(pathValido);
    await Promise.all(fotos.map((p) => borrarImagen(p)));
  }
  refrescar(id);
  redirect("/admin/blog?borrado=1");
}

/** Sube una foto (portada o del texto). Queda guardada en el artículo recién al guardarlo. */
export async function subirFotoArticulo(form: FormData): Promise<{ error?: string; foto?: ImagenArticulo }> {
  await requerirAdmin();
  const archivo = form.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "No llegó ninguna foto" };
  try {
    return { foto: await subirImagen(archivo, CARPETA) };
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "";
    if (mensaje.startsWith("La foto")) return { error: mensaje };
    console.error("Error al subir foto del blog", e);
    if (/bucket does not exist|notFound/i.test(mensaje)) {
      return { error: "El almacenamiento de fotos todavía no está activado en Firebase (Storage)." };
    }
    return { error: "No se pudo subir la foto. Inténtalo de nuevo en un rato." };
  }
}
