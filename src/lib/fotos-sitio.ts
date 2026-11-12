import type { StaticImageData } from "next/image";
import fotoCaminata from "@/assets/galeria-caminata.jpg";
import fotoCerro from "@/assets/galeria-cerro.jpg";
import fotoCharla from "@/assets/galeria-charla.jpg";
import fotoLlegada from "@/assets/galeria-llegada.jpg";
import fotoPasarela from "@/assets/galeria-pasarela.jpg";
import fotoRio from "@/assets/galeria-rio.jpg";
import fotoSendero from "@/assets/galeria-sendero.jpg";
import fotoEquipo from "@/assets/nosotros-equipo.jpg";
import fotoGrupal from "@/assets/portada-club.jpg";
import fotoPortada from "@/assets/portada-puente.jpg";

/**
 * Fotos de la página de inicio que Sally cambia en el panel > Contenido.
 * Se guardan en Firestore (ajustes/fotos), aparte de los textos, porque se guardan al instante.
 * Una foto es «incluida» (viene con el sitio, `clave`) o subida a Storage (`url` y `path`).
 */

export const FORMATOS = ["normal", "ancha", "vertical", "grande"] as const;
export type Formato = (typeof FORMATOS)[number];

export const NOMBRE_FORMATO: Record<Formato, string> = {
  normal: "Normal (1 cuadro)",
  ancha: "Ancha (2 de ancho)",
  vertical: "Alta (2 de alto)",
  grande: "Grande (2 × 2)",
};

export interface FotoSitio {
  /** Id estable dentro de la lista */
  id: string;
  /** Foto incluida en el sitio (ver FOTOS_INCLUIDAS) */
  clave?: string;
  url?: string;
  path?: string;
  alt: string;
}

export type FotoGaleriaSitio = FotoSitio & { formato: Formato };

export interface FotosSitio {
  portada: FotoSitio;
  nosotros: FotoSitio;
  galeria: FotoGaleriaSitio[];
}

export type LugarFoto = "portada" | "nosotros" | "galeria";

export const MAX_FOTOS_GALERIA = 16;

export const FOTOS_INCLUIDAS: Record<string, StaticImageData> = {
  "portada-puente": fotoPortada,
  "nosotros-equipo": fotoEquipo,
  "portada-club": fotoGrupal,
  "galeria-pasarela": fotoPasarela,
  "galeria-charla": fotoCharla,
  "galeria-llegada": fotoLlegada,
  "galeria-sendero": fotoSendero,
  "galeria-rio": fotoRio,
  "galeria-cerro": fotoCerro,
  "galeria-caminata": fotoCaminata,
};

const incluida = (clave: string, alt: string): FotoSitio => ({ id: clave, clave, alt });

export const FOTOS_POR_DEFECTO: FotosSitio = {
  portada: incluida(
    "portada-puente",
    "Niños, niñas y monitores del Club de la Montaña saludando felices junto a un puente del sendero",
  ),
  nosotros: incluida("nosotros-equipo", "Selfie del equipo de monitores del Club de la Montaña, sonriendo bajo los árboles"),
  // Los formatos llenan filas completas de cuatro columnas.
  galeria: [
    { ...incluida("portada-club", "Foto grupal de niños, niñas y monitores del club sentados en un claro del sendero"), formato: "grande" },
    { ...incluida("galeria-pasarela", "Niños y niñas del club en fila sobre una pasarela de madera junto a una monitora"), formato: "normal" },
    { ...incluida("galeria-charla", "Grupo con mochilas escuchando a los monitores antes de partir la caminata"), formato: "normal" },
    { ...incluida("galeria-llegada", "Llegada del grupo al inicio del sendero, rodeado de árboles"), formato: "ancha" },
    {
      ...incluida("galeria-sendero", "Niños y niñas con mochilas subiendo en fila por un sendero de cerro, con la cordillera al fondo"),
      formato: "vertical",
    },
    { ...incluida("galeria-rio", "Niños jugando en un estero y armando torres de piedras"), formato: "vertical" },
    { ...incluida("galeria-cerro", "Grupo caminando entre rocas y cactus en un cerro, con la ciudad a lo lejos"), formato: "vertical" },
    { ...incluida("galeria-caminata", "Monitora caminando junto a niños y niñas de la mano por un camino de tierra"), formato: "vertical" },
  ],
};

/** Junta lo guardado con las fotos incluidas. */
export function completarFotos(guardado: Partial<FotosSitio> | undefined): FotosSitio {
  const g = guardado ?? {};
  return {
    portada: g.portada ?? FOTOS_POR_DEFECTO.portada,
    nosotros: g.nosotros ?? FOTOS_POR_DEFECTO.nosotros,
    galeria: Array.isArray(g.galeria) ? g.galeria : FOTOS_POR_DEFECTO.galeria,
  };
}

/** Dirección para mostrar la foto (las incluidas, la versión original). */
export function srcFoto(f: FotoSitio): string {
  return f.clave ? (FOTOS_INCLUIDAS[f.clave]?.src ?? "") : (f.url ?? "");
}

/** Cuadros de la grilla (4 columnas) que ocupa la galería; si no es múltiplo de 4 queda un hueco. */
export function cuadrosGaleria(galeria: FotoGaleriaSitio[]): number {
  const area: Record<Formato, number> = { normal: 1, ancha: 2, vertical: 2, grande: 4 };
  return galeria.reduce((n, f) => n + area[f.formato], 0);
}
