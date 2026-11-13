/**
 * Encuesta de intereses para jóvenes de 13 a 16 años.
 * Las preguntas y opciones viven aquí para que el formulario, la validación,
 * el correo y el resumen del panel usen exactamente las mismas.
 * Para cambiar una opción basta con editar esta lista (las respuestas antiguas se conservan).
 * Las opciones siguen la inspiración Waldorf del club: naturaleza, trabajo con las manos,
 * arte, música y conversación.
 */

export const EDADES_ENCUESTA = [13, 14, 15, 16] as const;

/** Días en que la encuesta recibe respuestas (YYYY-MM-DD, hora de Chile, ambos incluidos). */
export const ENCUESTA_ABRE = "2026-12-14";
export const ENCUESTA_CIERRA = "2026-12-30";

/** "2026-12-14" -> "lunes 14 de diciembre" (sin depender de format.ts para que sirva en el navegador). */
export function fechaEncuesta(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, m - 1, d, 12)))
    .replace(",", "");
}

export type EstadoEncuesta = "pronto" | "abierta" | "cerrada";

export function estadoEncuesta(hoy: string): EstadoEncuesta {
  if (hoy < ENCUESTA_ABRE) return "pronto";
  if (hoy > ENCUESTA_CIERRA) return "cerrada";
  return "abierta";
}

export interface PreguntaOpciones {
  id: "juegos" | "actividades" | "temas" | "formatos";
  titulo: string;
  ayuda: string;
  opciones: string[];
  /** Permite escribir una opción propia */
  otro: boolean;
}

export const PREGUNTAS_ENCUESTA: PreguntaOpciones[] = [
  {
    id: "juegos",
    titulo: "¿Qué juegos te gustaría hacer?",
    ayuda: "Marca todos los que quieras.",
    opciones: [
      "Búsqueda del tesoro",
      "Captura la bandera",
      "Juegos de rol o misterio",
      "Desafíos en equipo",
      "Juegos de estrategia",
      "Juegos de mesa o cartas",
      "Juegos tradicionales",
      "Improvisación o teatro",
    ],
    otro: true,
  },
  {
    id: "actividades",
    titulo: "¿Qué actividades te interesan?",
    ayuda: "Marca todas las que te tinquen.",
    opciones: [
      "Caminatas por senderos",
      "Orientación con mapa y brújula",
      "Construir refugios",
      "Tallado en madera",
      "Tejido, fieltro o cestería",
      "Acuarela o dibujo",
      "Canto o música en grupo",
      "Reconocer flora y fauna",
      "Fotografía de naturaleza",
      "Primeros auxilios en montaña",
      "Técnicas de supervivencia y nudos",
      "Voluntariado o cuidado del entorno",
    ],
    otro: true,
  },
  {
    id: "temas",
    titulo: "¿De qué temas te gustaría conversar o debatir?",
    ayuda: "Marca los que te importen.",
    opciones: [
      "Quién soy y qué me mueve",
      "Amistad y relaciones",
      "Familia y crecer",
      "Emociones y salud mental",
      "Qué quiero estudiar o hacer en el futuro",
      "Vidas que inspiran",
      "Cuidar a otros",
      "Medio ambiente y cambio climático",
      "Redes sociales y pantallas",
      "Tecnología e inteligencia artificial",
      "Música, series y cultura",
      "Deporte y vida sana",
      "Viajes y otras culturas",
    ],
    otro: true,
  },
  {
    id: "formatos",
    titulo: "¿Cómo te gustaría que fueran las conversaciones?",
    ayuda: "Marca todas las que te acomoden.",
    opciones: [
      "Círculo de palabra",
      "Ronda de conversación libre",
      "Conversar a partir de un relato",
      "Escribir antes de compartir",
      "Debate por equipos",
      "Charla con un invitado",
      "Conversación caminando",
      "Prefiero solo actividades, sin conversaciones",
    ],
    otro: false,
  },
];

export const VINO_ANTES = ["Sí", "No"];
export const CON_AMIGOS = ["Vendría solo o sola", "Con un amigo o amiga", "Con varios amigos"];

export type IdPregunta = PreguntaOpciones["id"];

export interface RespuestaEncuesta {
  id: string;
  nombre: string;
  edad: number;
  /** Si ya participó antes en el club ("Sí" / "No" / "") */
  vinoAntes: string;
  /** Si vendría solo o con amigos */
  conAmigos: string;
  /** Opciones marcadas por pregunta */
  elegidas: Record<IdPregunta, string[]>;
  /** Texto libre de "otro", por pregunta */
  otros: Partial<Record<IdPregunta, string>>;
  /** Lo que no le gustaría que pasara */
  noMeGustaria: string;
  /** Nombre que propone para el grupo */
  nombreGrupo: string;
  comentario: string;
  /** Correo o teléfono del apoderado, opcional, para avisar cuando parta el club */
  contactoApoderado: string;
  creadoEn: number;
}
