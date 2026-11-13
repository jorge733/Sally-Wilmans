/**
 * Política de cambios y devoluciones, acordada con Sally (noviembre 2026).
 * Se muestra en /devoluciones, se acepta en la ficha y se resume en el correo de confirmación.
 * Si cambia, sube VERSION_DEVOLUCIONES: cada inscripción guarda la versión que aceptó.
 */
export const VERSION_DEVOLUCIONES = "2026-11";

export const TITULO_DEVOLUCIONES = "Política de cambios y devoluciones";

export const POLITICA_DEVOLUCIONES: { titulo: string; puntos: string[] }[] = [
  {
    titulo: "Si no pueden asistir a una salida",
    puntos: [
      "Avísanos por WhatsApp con al menos 24 horas de anticipación al inicio de la salida y te devolvemos el 100% de lo pagado.",
      "Si avisas con menos de 24 horas, el mismo día o el niño no llega, no hay devolución. Puede recuperar el día en otra salida sin pagar de nuevo, según los cupos disponibles, dentro de los 6 meses siguientes.",
    ],
  },
  {
    titulo: "Club de Verano",
    puntos: [
      "Cada semana se cancela completa. Si avisas por WhatsApp con al menos 24 horas de anticipación al primer día de la semana, te devolvemos el 100% de esa semana.",
      "Una vez que la semana comenzó, los días a los que no asista no se devuelven, pero se pueden recuperar en otra salida dentro de los 6 meses siguientes, según los cupos disponibles.",
    ],
  },
  {
    titulo: "Si el club suspende la salida",
    puntos: [
      "Si suspendemos una salida por mal tiempo, por no reunir el mínimo de inscritos o por cualquier otro motivo, te avisamos por WhatsApp y eliges: pasar a otra fecha o recibir la devolución del 100%.",
    ],
  },
  {
    titulo: "Cómo pedir la devolución",
    puntos: [
      "Los avisos se hacen solo por WhatsApp, indicando el nombre del niño y la salida. Las 24 horas se cuentan desde que llega tu mensaje.",
      "La devolución se hace por transferencia bancaria dentro de 3 días hábiles desde que nos envíes los datos de tu cuenta.",
    ],
  },
  {
    titulo: "Casos excepcionales",
    puntos: [
      "Los casos excepcionales, como una enfermedad con certificado médico, se evalúan caso a caso.",
    ],
  },
];

/** Versión corta para el correo de confirmación. */
export const RESUMEN_DEVOLUCIONES = [
  "Si no pueden asistir, avísanos por WhatsApp con al menos 24 horas de anticipación y te devolvemos el 100%.",
  "Con menos de 24 horas de aviso no hay devolución, pero puede recuperar el día en otra salida dentro de 6 meses.",
  "Si el club suspende la salida, eliges entre otra fecha o la devolución del 100%.",
];
