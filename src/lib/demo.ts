/**
 * Datos de ejemplo para el prototipo. En la siguiente etapa se reemplazan
 * por lo que Sally cargue desde su panel (Firebase).
 */
import type { AjustesSitio, Salida } from "./types";
import { AJUSTES_POR_DEFECTO } from "./site";

const base = {
  fotoUrl: null,
  fotoPath: null,
  estado: "publicada" as const,
  creadoEn: 0,
  actualizadoEn: 0,
};

export const SALIDAS_DEMO: Salida[] = [
  {
    ...base,
    id: "aguas-de-ramon",
    titulo: "Quebrada de Ramón y su cascada",
    fecha: "2026-11-14",
    horaInicio: "09:00",
    horaFin: "14:00",
    lugar: "Parque Aguas de Ramón, La Reina",
    puntoEncuentro: "Entrada del parque, Av. Álvaro Casanova 2583",
    edadMin: 7,
    edadMax: 12,
    precio: 18000,
    cupos: 16,
    cuposTomados: 9,
    descripcion:
      "Una caminata de media jornada por la quebrada, con paradas para observar aves y plantas nativas. Llegamos hasta la cascada para almorzar y volvemos por el mismo sendero.",
    queLlevar: [
      "Mochila pequeña",
      "Botella con 1,5 litros de agua",
      "Almuerzo y colación",
      "Bloqueador y jockey",
      "Zapatillas de trekking o con buena suela",
      "Cortaviento",
    ],
  },
  {
    ...base,
    id: "cerro-manquehue",
    titulo: "Primera cumbre: Manquehuito",
    fecha: "2026-11-22",
    horaInicio: "08:30",
    horaFin: "13:30",
    lugar: "Cerro Manquehue, Lo Barnechea",
    puntoEncuentro: "Estacionamiento del Club de Golf Sport Francés",
    edadMin: 9,
    edadMax: 14,
    precio: 20000,
    cupos: 12,
    cuposTomados: 11,
    descripcion:
      "Subida al Manquehuito, ideal para quienes ya han caminado antes. Aprendemos a usar los bastones, a dosificar el esfuerzo y a orientarnos con el paisaje de la ciudad a nuestros pies.",
    queLlevar: [
      "Mochila de 20 a 25 litros",
      "2 litros de agua",
      "Colación energética",
      "Bloqueador, lentes de sol y jockey",
      "Zapatos de trekking",
      "Polerón o polar",
    ],
  },
  {
    ...base,
    id: "parque-mahuida",
    titulo: "Exploradores del bosque",
    fecha: "2026-11-29",
    horaInicio: "10:00",
    horaFin: "13:00",
    lugar: "Parque Mahuida, La Reina",
    puntoEncuentro: "Portería del parque, Av. Alcalde Fernando Castillo Velasco 11095",
    edadMin: 4,
    edadMax: 7,
    precio: 15000,
    cupos: 14,
    cuposTomados: 14,
    descripcion:
      "Salida corta para los más pequeños: senderos suaves, juegos de exploración, búsqueda de huellas y un picnic en el bosque. Los apoderados pueden acompañar en la primera salida.",
    queLlevar: ["Mochila pequeña", "Botella de agua", "Colación", "Bloqueador y jockey", "Ropa cómoda"],
  },
  {
    ...base,
    id: "yerba-loca",
    titulo: "Día completo en Yerba Loca",
    fecha: "2026-12-06",
    horaInicio: "08:00",
    horaFin: "18:00",
    lugar: "Santuario de la Naturaleza Yerba Loca, Farellones",
    puntoEncuentro: "Metro Escuela Militar, salida Apoquindo (vamos en bus contratado)",
    edadMin: 10,
    edadMax: 15,
    precio: 32000,
    cupos: 20,
    cuposTomados: 6,
    descripcion:
      "Nuestra salida más larga del año: traslado en bus, caminata por el valle del estero Yerba Loca hasta Casa de Piedra y vuelta al atardecer. Incluye traslado y entrada al santuario.",
    queLlevar: [
      "Mochila de 25 a 30 litros",
      "2,5 litros de agua",
      "Almuerzo y dos colaciones",
      "Bloqueador, lentes de sol, jockey o sombrero",
      "Zapatos de trekking",
      "Primera capa térmica y cortaviento",
      "Muda de calcetines",
    ],
  },
];

export const AJUSTES_DEMO: AjustesSitio = {
  ...AJUSTES_POR_DEFECTO,
  whatsapp: "56912345678",
  email: "hola@clubdelamontana.cl",
  instagram: "clubdelamontana",
};

export function salidaDemo(id: string): Salida | undefined {
  return SALIDAS_DEMO.find((s) => s.id === id);
}
