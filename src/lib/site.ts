/**
 * Textos fijos del sitio, basados en el Instagram @clubdelamontanachile.
 * Se ajustan en las rondas de cambios con Sally.
 * Lo que Sally cambia sola va en el panel: textos de inicio en Contenido (lib/contenido.ts), WhatsApp, correo y autorización en Ajustes.
 */
export const SITIO = {
  nombre: "Club de la Montaña",
  nombreLargo: "Club de Niños en la Montaña",
  bajada: "Naturaleza, juego libre y vida sana para niños y niñas de 5 a 12 años",
  /** Lo que va tras el nombre en el título que muestra Google. */
  tituloBuscador: "Salidas al cerro para niños en Santiago",
  /** Unos 160 caracteres: lo que Google alcanza a mostrar bajo el título. */
  descripcion:
    "Salidas al cerro para niños y niñas de 5 a 12 años en Santiago: senderismo, juego libre y vida sana, inspirado en la pedagogía Waldorf. Revisa las fechas e inscríbete en línea.",
  responsable: "Sally Wilmans Cifuentes",
  ciudad: "Santiago, Chile",
  desde: 2018,
  edades: "5 a 12 años",
  instagram: "clubdelamontanachile",
};

/**
 * Open Graph común. Next reemplaza el bloque openGraph entero cuando una página
 * define el suyo, así que cada página parte de esta base y agrega lo propio.
 */
export const OG_BASE = {
  type: "website",
  locale: "es_CL",
  siteName: SITIO.nombre,
  title: `${SITIO.nombre} · ${SITIO.bajada}`,
  description: SITIO.descripcion,
} as const;

/** Los cuatro pilares que aparecen en los afiches del club. */
export const PILARES = ["Naturaleza", "Senderismo", "Juego libre", "Vida sana"];

export const AJUSTES_POR_DEFECTO = {
  whatsapp: "",
  email: "",
  instagram: "",
  textoAutorizacion:
    "Autorizo a mi(s) hijo(s) o hija(s) a participar en la actividad indicada, organizada por Club de la Montaña. Declaro que la información de salud entregada es verdadera y completa, y que conozco las indicaciones de la salida. (Texto provisorio: Sally debe reemplazarlo por la autorización definitiva.)",
};

export const PASOS = [
  {
    titulo: "Elige la fecha",
    texto: "Revisa el calendario: lugar, horario, edades y lo que hay que llevar.",
  },
  {
    titulo: "Completa la ficha",
    texto: "Datos de cada niño, alergias y salud, quién lo retira, contacto de emergencia y tu autorización.",
  },
  {
    titulo: "Paga en línea",
    texto: "Con Flow: tarjeta de débito, crédito u otros medios. El cupo queda reservado al pagar.",
  },
  {
    titulo: "¡Nos vemos en el cerro!",
    texto: "Te llega un correo con el comprobante, el punto de encuentro y la lista de lo que deben llevar.",
  },
];

export const CUIDADOS = [
  {
    titulo: "Grupos pequeños",
    texto: "Cada salida tiene cupos limitados para que todos los niños vayan acompañados de cerca.",
  },
  {
    titulo: "Adultos a cargo",
    texto: "Monitores con experiencia en montaña y en trabajo con niños, durante toda la jornada.",
  },
  {
    titulo: "Ficha de salud",
    texto: "Conocemos de antemano las alergias, cuidados y contactos de emergencia de cada niño.",
  },
  {
    titulo: "Rutas a su medida",
    texto: "Senderos según la edad del grupo, con pausas, juegos tradicionales y tiempo para asombrarse.",
  },
];

export const PREGUNTAS = [
  {
    p: "¿Para qué edades son las salidas?",
    r: "Para niños y niñas de 5 a 12 años. En cada salida verás el rango de edad exacto.",
  },
  {
    p: "¿Dónde son las salidas?",
    r: "En cerros y parques precordilleranos de Santiago, como el Parque Quebrada de Macul y el Parque Aguas de Ramón.",
  },
  {
    p: "¿Qué pasa si la salida se llena?",
    r: "El cupo se descuenta solo al pagar. Cuando no quedan cupos, la fecha aparece como completa y ya no recibe inscripciones.",
  },
  {
    p: "¿Puedo inscribir a más de un hijo?",
    r: "Sí. En la misma inscripción puedes agregar a varios niños, cada uno con su ficha.",
  },
  {
    p: "¿Cómo pago?",
    r: "En línea a través de Flow, con tarjeta de débito o crédito (Webpay) u otros medios de pago que ofrece Flow.",
  },
  {
    p: "¿Qué pasa si llueve o hay mal tiempo?",
    r: "Si las condiciones no son seguras, suspendemos la salida y les avisamos por WhatsApp. Ustedes eligen: pasar a otra fecha o recibir la devolución del 100%.",
  },
  {
    p: "¿Y si mi hijo o hija no puede ir?",
    r: "Avísanos por WhatsApp con al menos 24 horas de anticipación y te devolvemos el 100% por transferencia. Si avisas con menos tiempo, no hay devolución, pero puede recuperar el día en otra salida dentro de 6 meses. Revisa la política completa en la página de cambios y devoluciones.",
  },
];

export function urlSitio(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
