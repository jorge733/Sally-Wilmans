/**
 * Encuesta de intereses para jóvenes de 13 a 16 años.
 * Las preguntas y opciones viven aquí para que el formulario, la validación,
 * el correo y el resumen del panel usen exactamente las mismas.
 * Para cambiar una opción basta con editar esta lista (las respuestas antiguas se conservan).
 */

export const EDADES_ENCUESTA = [13, 14, 15, 16] as const;

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
      "Juegos nocturnos con linterna",
    ],
    otro: true,
  },
  {
    id: "actividades",
    titulo: "¿Qué actividades te interesan?",
    ayuda: "Marca todas las que te tinquen.",
    opciones: [
      "Trekking a cumbres",
      "Campamento con noche afuera",
      "Orientación con mapa y brújula",
      "Escalada o rappel",
      "Cocina de campamento",
      "Observar estrellas",
      "Fotografía de naturaleza",
      "Primeros auxilios en montaña",
      "Técnicas de supervivencia y nudos",
      "Voluntariado o cuidado del entorno",
      "Arte, música o fogata",
    ],
    otro: true,
  },
  {
    id: "temas",
    titulo: "¿De qué temas te gustaría conversar o debatir?",
    ayuda: "Marca los que te importen.",
    opciones: [
      "Medio ambiente y cambio climático",
      "Redes sociales y pantallas",
      "Amistad y relaciones",
      "Emociones y salud mental",
      "Qué quiero estudiar o hacer en el futuro",
      "Tecnología e inteligencia artificial",
      "Igualdad y derechos",
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
      "Ronda de conversación libre",
      "Debate por equipos",
      "Charla con un invitado",
      "Conversación caminando",
      "Alrededor de una fogata",
      "Prefiero solo actividades, sin conversaciones",
    ],
    otro: false,
  },
];

export const FRECUENCIAS = ["Cada semana", "Cada dos semanas", "Una vez al mes", "Solo en vacaciones"];
export const DIAS_PREFERIDOS = ["Sábado", "Domingo", "Viernes en la tarde", "Otro día de semana en la tarde"];

export type IdPregunta = PreguntaOpciones["id"];

export interface RespuestaEncuesta {
  id: string;
  nombre: string;
  edad: number;
  /** Opciones marcadas por pregunta (incluye las escritas en "otro") */
  elegidas: Record<IdPregunta, string[]>;
  /** Texto libre de "otro", por pregunta */
  otros: Partial<Record<IdPregunta, string>>;
  frecuencia: string;
  dias: string[];
  comentario: string;
  creadoEn: number;
}
