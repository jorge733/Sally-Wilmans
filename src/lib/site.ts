/**
 * Textos fijos del sitio. Se ajustan en las rondas de cambios con Sally.
 * Lo que Sally cambia sola (WhatsApp, correo, autorización) está en el panel > Ajustes.
 */
export const SITIO = {
  nombre: "Club de la Montaña",
  bajada: "Salidas a la montaña para niños y niñas",
  descripcion:
    "Taller de montaña para niños: salidas guiadas a la naturaleza, en grupos pequeños y con adultos a cargo. Revisa las próximas salidas, inscribe a tus hijos y paga en línea.",
  responsable: "Sally Willmans",
  ciudad: "Santiago, Chile",
};

export const AJUSTES_POR_DEFECTO = {
  whatsapp: "",
  email: "",
  instagram: "",
  textoAutorizacion:
    "Autorizo a mi(s) hijo(s) o hija(s) a participar en la salida indicada, organizada por Club de la Montaña. Declaro que la información de salud entregada es verdadera y completa, y que conozco las indicaciones de la salida. (Texto provisorio: Sally debe reemplazarlo por la autorización definitiva desde el panel.)",
};

export const PASOS = [
  {
    titulo: "Elige la salida",
    texto: "Revisa el calendario: fecha, lugar, edades, horario y lo que hay que llevar.",
  },
  {
    titulo: "Completa la ficha",
    texto: "Datos de cada niño, alergias o datos de salud, contacto de emergencia y tu autorización.",
  },
  {
    titulo: "Paga en línea",
    texto: "Con Mercado Pago: débito, crédito o en cuotas. El cupo queda reservado al pagar.",
  },
  {
    titulo: "Te llega el comprobante",
    texto: "Recibes un correo con el detalle de la salida y la lista de lo que deben llevar.",
  },
];

export const CUIDADOS = [
  {
    titulo: "Grupos pequeños",
    texto: "Cada salida tiene cupos limitados para que todos los niños vayan acompañados de cerca.",
  },
  {
    titulo: "Adultos a cargo",
    texto: "Guías con experiencia en montaña y en trabajo con niños, durante toda la jornada.",
  },
  {
    titulo: "Ficha de salud",
    texto: "Conocemos de antemano las alergias, cuidados y contactos de emergencia de cada niño.",
  },
  {
    titulo: "Rutas a su medida",
    texto: "Elegimos senderos según la edad del grupo, con pausas, juegos y tiempo para observar.",
  },
];

export const PREGUNTAS = [
  {
    p: "¿Qué pasa si la salida se llena?",
    r: "El cupo se descuenta solo al pagar. Cuando no quedan cupos, la salida aparece como completa y ya no recibe inscripciones.",
  },
  {
    p: "¿Cómo pago?",
    r: "Con Mercado Pago, usando tarjeta de débito, crédito (también en cuotas) u otros medios que ofrece Mercado Pago.",
  },
  {
    p: "¿Puedo inscribir a más de un hijo?",
    r: "Sí. En la misma inscripción puedes agregar a varios niños, cada uno con su ficha.",
  },
  {
    p: "¿Qué pasa si llueve o hay mal tiempo?",
    r: "Si las condiciones no son seguras, la salida se reprograma y te avisamos con anticipación.",
  },
];

export function urlSitio(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
