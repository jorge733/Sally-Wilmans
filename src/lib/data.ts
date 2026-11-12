import "server-only";
import { cache } from "react";
import { db } from "./firebase-admin";
import { hoyChile } from "./format";
import { ultimoDia } from "./salida-utils";
export { cuposLibres, salidaAbierta } from "./salida-utils";
import type { RespuestaEncuesta } from "./encuesta";
import { AJUSTES_POR_DEFECTO } from "./site";
import type { AjustesSitio, FotoGaleria, Inscripcion, Salida } from "./types";

type Doc = FirebaseFirestore.DocumentSnapshot;

export function aSalida(d: Doc): Salida {
  const x = d.data() ?? {};
  return {
    id: d.id,
    titulo: x.titulo ?? "",
    fecha: x.fecha ?? "",
    fechaFin: x.fechaFin ?? null,
    horaInicio: x.horaInicio ?? "",
    horaFin: x.horaFin ?? "",
    lugar: x.lugar ?? "",
    puntoEncuentro: x.puntoEncuentro ?? "",
    edadMin: x.edadMin ?? 0,
    edadMax: x.edadMax ?? 0,
    precio: x.precio ?? 0,
    cupos: x.cupos ?? 0,
    cuposTomados: x.cuposTomados ?? 0,
    semanas: Array.isArray(x.semanas) ? x.semanas : [],
    precioDia: x.precioDia || null,
    descripcion: x.descripcion ?? "",
    queLlevar: x.queLlevar ?? [],
    fotos: Array.isArray(x.fotos)
      ? x.fotos
      : x.fotoUrl
        ? [{ url: x.fotoUrl, path: x.fotoPath ?? "", alt: "" }]
        : [],
    fotoUrl: x.fotoUrl ?? null,
    fotoPath: x.fotoPath ?? null,
    estado: x.estado ?? "borrador",
    creadoEn: x.creadoEn ?? 0,
    actualizadoEn: x.actualizadoEn ?? 0,
  };
}

export function aInscripcion(d: Doc): Inscripcion {
  return { id: d.id, ...(d.data() as Omit<Inscripcion, "id">) };
}

export async function salidasPublicas(): Promise<Salida[]> {
  const snap = await db.collection("salidas").where("estado", "in", ["publicada", "cerrada"]).get();
  const hoy = hoyChile();
  return snap.docs
    .map(aSalida)
    .filter((s) => ultimoDia(s) >= hoy)
    .sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio));
}

export async function todasLasSalidas(): Promise<Salida[]> {
  const snap = await db.collection("salidas").get();
  return snap.docs.map(aSalida).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export const obtenerSalida = cache(async (id: string): Promise<Salida | null> => {
  if (!id || id.includes("/")) return null;
  const d = await db.collection("salidas").doc(id).get();
  return d.exists ? aSalida(d) : null;
});

export async function obtenerInscripcion(id: string): Promise<Inscripcion | null> {
  if (!id || id.includes("/")) return null;
  const d = await db.collection("inscripciones").doc(id).get();
  return d.exists ? aInscripcion(d) : null;
}

export async function inscripcionesDeSalida(salidaId: string): Promise<Inscripcion[]> {
  const snap = await db.collection("inscripciones").where("salidaId", "==", salidaId).get();
  return snap.docs.map(aInscripcion).sort((a, b) => a.creadoEn - b.creadoEn);
}

export const obtenerAjustes = cache(async (): Promise<AjustesSitio> => {
  const d = await db.collection("ajustes").doc("sitio").get();
  return { ...AJUSTES_POR_DEFECTO, ...(d.data() ?? {}) } as AjustesSitio;
});

export async function obtenerGaleria(): Promise<FotoGaleria[]> {
  const snap = await db.collection("galeria").get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<FotoGaleria, "id">) }))
    .sort((a, b) => a.orden - b.orden || a.creadoEn - b.creadoEn);
}

export async function respuestasEncuesta(): Promise<RespuestaEncuesta[]> {
  const snap = await db.collection("encuestaJovenes").orderBy("creadoEn", "desc").get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      nombre: x.nombre ?? "",
      edad: x.edad ?? 0,
      elegidas: x.elegidas ?? {},
      otros: x.otros ?? {},
      frecuencia: x.frecuencia ?? "",
      dias: x.dias ?? [],
      comentario: x.comentario ?? "",
      creadoEn: x.creadoEn ?? 0,
    } as RespuestaEncuesta;
  });
}
