import { z } from "zod";
import { CUIDADOS, PASOS, PILARES, PREGUNTAS, SITIO } from "./site";

/**
 * Textos de la página de inicio que Sally edita en el panel > Contenido.
 * Se guardan en Firestore (ajustes/contenido); lo que falte se completa con estos valores.
 */

const texto = (max: number) => z.string().trim().max(max, `Hay un texto de más de ${max} letras`);
const tarjeta = z.object({ titulo: texto(80), texto: texto(400) });

export const esquemaContenido = z.object({
  encuesta: z.object({
    mostrar: z.boolean(),
    bannerDestacado: texto(80),
    bannerTexto: texto(200),
    bannerBoton: texto(40),
    titulo: texto(120),
    texto: texto(400),
  }),
  portada: z.object({
    antetitulo: texto(80),
    titulo: texto(120),
    texto: texto(400),
    pieFoto: texto(60),
    lineaFinal: texto(160),
  }),
  pilares: z.array(texto(30)).max(8, "Máximo 8 pilares"),
  fechas: z.object({
    titulo: texto(80),
    texto: texto(400),
    vacioTitulo: texto(80),
    vacioTexto: texto(400),
  }),
  nosotros: z.object({
    titulo: texto(120),
    parrafos: texto(3000),
    sello: texto(30),
    selloTexto: texto(60),
  }),
  verano: z.object({
    mostrar: z.boolean(),
    titulo: texto(200),
    texto: texto(800),
    boton: texto(40),
  }),
  pasos: z.object({ titulo: texto(120), lista: z.array(tarjeta).max(8, "Máximo 8 pasos") }),
  cuidados: z.object({ titulo: texto(120), lista: z.array(tarjeta).max(8, "Máximo 8 cuidados") }),
  galeria: z.object({ titulo: texto(120) }),
  preguntas: z.object({
    titulo: texto(120),
    lista: z.array(z.object({ p: texto(200), r: texto(1500) })).max(30, "Máximo 30 preguntas"),
  }),
  contacto: z.object({ antetitulo: texto(60), titulo: texto(120), texto: texto(400) }),
});

export type ContenidoSitio = z.infer<typeof esquemaContenido>;

export const CONTENIDO_POR_DEFECTO: ContenidoSitio = {
  encuesta: {
    mostrar: true,
    bannerDestacado: "¿Tienes entre 13 y 16 años?",
    bannerTexto: "Cuéntanos qué te gustaría hacer en el nuevo grupo de jóvenes.",
    bannerBoton: "Responde la encuesta",
    titulo: "Ayúdanos a armar el grupo de jóvenes",
    texto: "Cuéntanos qué juegos, actividades y temas para conversar o debatir te gustaría tener. Son solo 3 minutos.",
  },
  portada: {
    antetitulo: SITIO.nombreLargo,
    titulo: "Llevamos a los niños al cerro a ser niños",
    texto: `Salidas a la naturaleza para niños y niñas de ${SITIO.edades}: jugar, moverse, explorar, asombrarse y compartir con otros niños, lejos de las pantallas.`,
    pieFoto: "¡La familia del club!",
    lineaFinal: `Inspirado en la pedagogía Waldorf · ${SITIO.ciudad} · Desde ${SITIO.desde}`,
  },
  pilares: PILARES,
  fechas: {
    titulo: "Próximas fechas",
    texto:
      "Salidas de sábado en la mañana y nuestro Club de Verano en diciembre y enero. Los cupos son limitados y la inscripción se cierra sola cuando se llenan.",
    vacioTitulo: "¡Pronto nuevas fechas!",
    vacioTexto: "Estamos preparando las próximas salidas. Síguenos en Instagram o escríbenos para enterarte primero.",
  },
  nosotros: {
    titulo: "Recuperar la niñez verdadera",
    parrafos: [
      `En el Club de la Montaña ayudamos a madres y padres de niños y niñas de ${SITIO.edades} a recuperar la niñez verdadera: con naturaleza, juego libre y socialización real.`,
      "Inspirados en la pedagogía Waldorf, salimos al cerro a caminar, jugar, hacer talleres y juegos tradicionales, y a descubrir lo que nos regala la Madre Tierra en cada estación: las añañucas de la primavera, el sol del verano, las hojas del otoño.",
      `El club lo dirige **${SITIO.responsable}**, junto a un equipo que acompaña a cada grupo con cariño y cuidado.`,
    ].join("\n\n"),
    sello: `Desde ${SITIO.desde}`,
    selloTexto: "llevando niños al cerro",
  },
  verano: {
    mostrar: true,
    titulo: "Del 9 al 30 de diciembre y del 4 al 29 de enero, en el Parque Natural Aguas de Ramón",
    texto:
      "De lunes a viernes, de 9:00 a 13:00, con recepción desde las 8:30. Juego libre, caminatas y juegos tradicionales para niños y niñas de 5 a 12 años. Puedes inscribir a tus hijos por día ($18.500) o por semana completa ($80.000), con la entrada al parque incluida.",
    boton: "Ver días y semanas",
  },
  pasos: { titulo: "Inscribir es así de simple", lista: PASOS },
  cuidados: { titulo: "Cómo cuidamos a los niños", lista: CUIDADOS },
  galeria: { titulo: "Así son nuestras salidas" },
  preguntas: { titulo: "Queridas familias", lista: PREGUNTAS },
  contacto: {
    antetitulo: "¡Les esperamos!",
    titulo: "¿Tienes dudas?",
    texto: "Escríbenos si tienes preguntas sobre una salida, las edades o lo que tu hijo o hija necesita llevar.",
  },
};

/** Junta lo guardado con los valores por defecto, sección por sección. */
export function completarContenido(guardado: Partial<Record<keyof ContenidoSitio, unknown>> | undefined): ContenidoSitio {
  const d = CONTENIDO_POR_DEFECTO;
  const g = (guardado ?? {}) as Partial<ContenidoSitio>;
  const obj = <K extends keyof ContenidoSitio>(k: K) =>
    ({ ...(d[k] as object), ...((g[k] as object) ?? {}) }) as ContenidoSitio[K];
  return {
    encuesta: obj("encuesta"),
    portada: obj("portada"),
    pilares: Array.isArray(g.pilares) ? g.pilares : d.pilares,
    fechas: obj("fechas"),
    nosotros: obj("nosotros"),
    verano: obj("verano"),
    pasos: obj("pasos"),
    cuidados: obj("cuidados"),
    galeria: obj("galeria"),
    preguntas: obj("preguntas"),
    contacto: obj("contacto"),
  };
}
