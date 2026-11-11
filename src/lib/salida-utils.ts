import { hoyChile } from "./format";
import type { Salida, Semana } from "./types";

/** La familia elige semanas completas (Club de Verano). */
export function porSemanas(s: Pick<Salida, "semanas">): boolean {
  return s.semanas.length > 0;
}

export function libresSemana(sem: Semana): number {
  return Math.max(0, sem.cupos - sem.cuposTomados);
}

/** Se puede elegir hasta el día en que parte la semana, si quedan cupos. */
export function semanaAbierta(sem: Semana, hoy = hoyChile()): boolean {
  return sem.inicio >= hoy && libresSemana(sem) > 0;
}

/** Semanas que todavía no parten. */
export function semanasVigentes(s: Salida, hoy = hoyChile()): Semana[] {
  return s.semanas.filter((w) => w.inicio >= hoy);
}

/**
 * Cupos libres. En salidas por semanas: los de la semana vigente con más espacio
 * (cuántos niños se pueden inscribir como máximo en alguna semana).
 */
export function cuposLibres(s: Salida): number {
  if (porSemanas(s)) return Math.max(0, ...semanasVigentes(s).map(libresSemana));
  return Math.max(0, s.cupos - s.cuposTomados);
}

/** Último día en que la salida aún puede recibir inscripciones (para listarla en el sitio). */
export function ultimoDia(s: Salida): string {
  if (porSemanas(s)) return s.semanas.reduce((m, w) => (w.inicio > m ? w.inicio : m), "");
  return s.fecha;
}

/** Abierta = publicada, con fecha de hoy en adelante y con cupos. */
export function salidaAbierta(s: Salida): boolean {
  if (s.estado !== "publicada") return false;
  if (porSemanas(s)) return s.semanas.some((w) => semanaAbierta(w));
  return s.fecha >= hoyChile() && cuposLibres(s) > 0;
}

/** Número estable a partir del id, para elegir la ilustración de cada salida. */
export function varianteDe(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 97;
}

/** Máximo de fotos por salida */
export const MAX_FOTOS_SALIDA = 12;
