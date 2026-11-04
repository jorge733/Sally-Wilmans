/**
 * Datos de ejemplo para el prototipo, basados en las publicaciones de
 * @clubdelamontanachile (lugares, horarios, edades y cupos). Los precios son
 * provisorios. En la siguiente etapa se reemplazan por los datos reales.
 */
import type { AjustesSitio, Salida } from "./types";
import { AJUSTES_POR_DEFECTO } from "./site";

const base = {
  fotoUrl: null,
  fotoPath: null,
  estado: "publicada" as const,
  creadoEn: 0,
  actualizadoEn: 0,
  edadMin: 5,
  edadMax: 12,
};

const sabado = {
  ...base,
  horaInicio: "08:45",
  horaFin: "13:00",
  precio: 15000,
  cupos: 20,
};

const LLEVAR_SABADO = [
  "Mochila pequeña",
  "Botella con agua (mínimo 1 litro)",
  "Colación saludable",
  "Bloqueador, jockey o sombrero",
  "Zapatillas con buena suela",
  "Ropa cómoda que se pueda ensuciar",
  "Cortaviento o polerón",
];

const MACUL = {
  lugar: "Parque Quebrada de Macul, Peñalolén",
  puntoEncuentro: "Entrada del parque, al final de Av. José Arrieta (se confirma por WhatsApp)",
};

const RAMON = {
  lugar: "Parque Aguas de Ramón, La Reina",
  puntoEncuentro: "Entrada del parque, Av. Álvaro Casanova 2583 (se confirma por WhatsApp)",
};

const verano = {
  ...base,
  horaInicio: "09:00",
  horaFin: "13:00",
  precio: 90000,
  cupos: 20,
  lugar: "Cerros y parques de la precordillera de Santiago",
  puntoEncuentro: "Se informa a las familias inscritas",
  descripcion:
    "Una semana completa en la naturaleza, de lunes a viernes. Cada día exploramos un sendero distinto, jugamos libremente, hacemos talleres y juegos tradicionales, y compartimos la colación al aire libre. Una de las versiones más esperadas del año.",
  queLlevar: [
    "Mochila de 15 a 20 litros",
    "Botella con 1,5 litros de agua",
    "Colación saludable para cada día",
    "Bloqueador, jockey o sombrero",
    "Zapatillas de trekking o con buena suela",
    "Ropa cómoda y una muda de recambio",
  ],
};

export const SALIDAS_DEMO: Salida[] = [
  {
    ...sabado,
    ...MACUL,
    id: "macul-7-nov",
    titulo: "Primavera en Quebrada de Macul",
    fecha: "2026-11-07",
    cuposTomados: 12,
    descripcion:
      "La primavera está haciendo de las suyas: salimos a investigar las flores, los insectos y las plantitas que están creciendo en la quebrada. Caminata, juego libre y juegos tradicionales en la naturaleza.",
    queLlevar: LLEVAR_SABADO,
  },
  {
    ...sabado,
    ...RAMON,
    id: "ramon-14-nov",
    titulo: "Exploradores en Aguas de Ramón",
    fecha: "2026-11-14",
    cuposTomados: 8,
    descripcion:
      "Subimos por la quebrada siguiendo el estero, buscando huellas, piedras y rincones para jugar. Una mañana para moverse, explorar, asombrarse y compartir con otros niños.",
    queLlevar: LLEVAR_SABADO,
  },
  {
    ...sabado,
    ...MACUL,
    id: "macul-21-nov",
    titulo: "Caminata y juego libre en Macul",
    fecha: "2026-11-21",
    cuposTomados: 20,
    descripcion:
      "Caminata por los senderos de la quebrada, con pausas para observar el paisaje, juego libre y una colación compartida al aire libre.",
    queLlevar: LLEVAR_SABADO,
  },
  {
    ...sabado,
    ...RAMON,
    id: "ramon-28-nov",
    titulo: "Despedida de noviembre en Aguas de Ramón",
    fecha: "2026-11-28",
    cuposTomados: 17,
    descripcion:
      "Cerramos el mes en la montaña: sendero, juegos tradicionales y un círculo final para compartir lo que más nos gustó de la temporada.",
    queLlevar: LLEVAR_SABADO,
  },
  {
    ...verano,
    id: "verano-2027-semana-1",
    titulo: "Club de Verano 2027 · Semana 1",
    fecha: "2027-01-11",
    fechaFin: "2027-01-15",
    cuposTomados: 9,
  },
  {
    ...verano,
    id: "verano-2027-semana-2",
    titulo: "Club de Verano 2027 · Semana 2",
    fecha: "2027-01-18",
    fechaFin: "2027-01-22",
    cuposTomados: 4,
  },
];

export const AJUSTES_DEMO: AjustesSitio = {
  ...AJUSTES_POR_DEFECTO,
  whatsapp: "56982326966",
  email: "",
  instagram: "clubdelamontanachile",
};

export function salidaDemo(id: string): Salida | undefined {
  return SALIDAS_DEMO.find((s) => s.id === id);
}
