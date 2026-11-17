/**
 * Artículos del blog que Sally escribe en el panel > Blog.
 * Se guardan en Firestore (colección "blog"); el id es la dirección del artículo (/blog/<id>)
 * y no cambia aunque se edite el título, para no romper enlaces ya compartidos.
 *
 * El texto se escribe con un formato simple (el mismo que se ve en la ayuda del editor):
 *   ## Subtítulo          ### Subtítulo menor
 *   - punto de lista      1. lista numerada
 *   > cita                ![descripción](url de foto)
 *   **negrita**  *cursiva*  [texto del enlace](https://…)
 * Los párrafos se separan con una línea en blanco.
 * Este archivo no usa nada del servidor: también lo usa la vista previa del editor.
 */

export type EstadoArticulo = "publicado" | "borrador";

export interface ImagenArticulo {
  url: string;
  path: string;
}

export interface Articulo {
  id: string;
  titulo: string;
  /** Bajada corta: se ve en el listado y al compartir el enlace */
  resumen: string;
  cuerpo: string;
  portada: (ImagenArticulo & { alt: string }) | null;
  /** Fotos subidas para el cuerpo, para poder borrarlas junto con el artículo */
  imagenes: ImagenArticulo[];
  estado: EstadoArticulo;
  /** Fecha que se muestra (YYYY-MM-DD) */
  fecha: string;
  creadoEn: number;
  actualizadoEn: number;
}

export const MAX_TITULO = 140;
export const MAX_RESUMEN = 300;
export const MAX_CUERPO = 40_000;

/* ───────────── Texto del artículo ───────────── */

export type Bloque =
  | { tipo: "p"; texto: string }
  | { tipo: "h2" | "h3"; texto: string }
  | { tipo: "ul" | "ol"; items: string[] }
  | { tipo: "cita"; texto: string }
  | { tipo: "foto"; url: string; alt: string };

const FOTO = /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/;

/** Divide el texto en bloques: párrafos, subtítulos, listas, citas y fotos. */
export function bloquesArticulo(cuerpo: string): Bloque[] {
  const bloques: Bloque[] = [];
  let parrafo: string[] = [];
  const cerrarParrafo = () => {
    if (parrafo.length) bloques.push({ tipo: "p", texto: parrafo.join("\n") });
    parrafo = [];
  };
  for (const cruda of cuerpo.replace(/\r\n?/g, "\n").split("\n")) {
    const linea = cruda.trim();
    const ultimo = bloques[bloques.length - 1];
    let m: RegExpMatchArray | null;
    if (!linea) {
      cerrarParrafo();
    } else if ((m = linea.match(/^(#{2,3})\s+(.+)$/))) {
      cerrarParrafo();
      bloques.push({ tipo: m[1].length === 2 ? "h2" : "h3", texto: m[2] });
    } else if ((m = linea.match(FOTO))) {
      cerrarParrafo();
      bloques.push({ tipo: "foto", alt: m[1].trim(), url: m[2] });
    } else if ((m = linea.match(/^[-*•]\s+(.+)$/))) {
      cerrarParrafo();
      if (ultimo?.tipo === "ul") ultimo.items.push(m[1]);
      else bloques.push({ tipo: "ul", items: [m[1]] });
    } else if ((m = linea.match(/^\d+[.)]\s+(.+)$/))) {
      cerrarParrafo();
      if (ultimo?.tipo === "ol") ultimo.items.push(m[1]);
      else bloques.push({ tipo: "ol", items: [m[1]] });
    } else if ((m = linea.match(/^>\s?(.*)$/))) {
      cerrarParrafo();
      if (ultimo?.tipo === "cita") ultimo.texto += `\n${m[1]}`;
      else bloques.push({ tipo: "cita", texto: m[1] });
    } else {
      parrafo.push(linea);
    }
  }
  cerrarParrafo();
  return bloques;
}

export type Trozo =
  | { tipo: "texto"; texto: string }
  | { tipo: "negrita" | "cursiva"; texto: string }
  | { tipo: "enlace"; texto: string; url: string };

const EN_LINEA = /\*\*(.+?)\*\*|\*([^*\s](?:[^*]*[^*\s])?)\*|\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:)[^)\s]+)\)/g;

/** Divide una línea en texto normal, **negritas**, *cursivas* y [enlaces](url). */
export function trozosLinea(texto: string): Trozo[] {
  const trozos: Trozo[] = [];
  let desde = 0;
  for (const m of texto.matchAll(EN_LINEA)) {
    if (m.index > desde) trozos.push({ tipo: "texto", texto: texto.slice(desde, m.index) });
    if (m[1] !== undefined) trozos.push({ tipo: "negrita", texto: m[1] });
    else if (m[2] !== undefined) trozos.push({ tipo: "cursiva", texto: m[2] });
    else trozos.push({ tipo: "enlace", texto: m[3], url: m[4] });
    desde = m.index + m[0].length;
  }
  if (desde < texto.length) trozos.push({ tipo: "texto", texto: texto.slice(desde) });
  return trozos;
}

/** El texto sin marcas de formato, para contar palabras o armar descripciones. */
export function textoPlano(cuerpo: string): string {
  return bloquesArticulo(cuerpo)
    .map((b) => ("items" in b ? b.items.join(" ") : b.tipo === "foto" ? "" : b.texto))
    .join(" ")
    .replace(EN_LINEA, (_, a, b, c) => a ?? b ?? c ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Minutos de lectura (unas 200 palabras por minuto). */
export function minutosLectura(cuerpo: string): number {
  const palabras = textoPlano(cuerpo).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

/** "2026-11-17" -> "17 de noviembre de 2026" */
export function fechaArticulo(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  if (!y) return "";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}

/** URLs de las fotos que aparecen en el texto. */
export function fotosDelCuerpo(cuerpo: string): string[] {
  return bloquesArticulo(cuerpo).flatMap((b) => (b.tipo === "foto" ? [b.url] : []));
}
