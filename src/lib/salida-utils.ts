import { hoyChile, listaDias, rangoDias, sumarDias } from "./format";
import type { Salida, Semana, SemanaInscrita } from "./types";

/** La familia elige semanas (Club de Verano), y días sueltos si la salida tiene precio por día. */
export function porSemanas(s: Pick<Salida, "semanas">): boolean {
  return s.semanas.length > 0;
}

/** Se pueden elegir días sueltos además de semanas completas. */
export function porDia(s: Pick<Salida, "semanas" | "precioDia">): boolean {
  return porSemanas(s) && (s.precioDia ?? 0) > 0;
}

/** Días de lunes a viernes de la semana (YYYY-MM-DD). */
export function diasSemana(w: Pick<Semana, "inicio" | "fin">): string[] {
  const dias: string[] = [];
  for (let f = w.inicio; f <= w.fin; f = sumarDias(f, 1)) {
    const d = new Date(`${f}T12:00:00Z`).getUTCDay();
    if (d !== 0 && d !== 6) dias.push(f);
  }
  return dias;
}

/** Niños inscritos un día de la semana. */
export function tomadosEn(w: Semana, dia: string): number {
  return w.tomadosDia ? (w.tomadosDia[dia] ?? 0) : w.cuposTomados;
}

export function libresDia(w: Semana, dia: string): number {
  return Math.max(0, w.cupos - tomadosEn(w, dia));
}

/** Cupos para la semana completa: los del día más lleno. */
export function libresSemana(w: Semana): number {
  const dias = diasSemana(w);
  return dias.length ? Math.min(...dias.map((f) => libresDia(w, f))) : 0;
}

/** Un día se puede elegir hasta ese mismo día, si quedan cupos. */
export function diaAbierto(w: Semana, dia: string, hoy = hoyChile()): boolean {
  return dia >= hoy && libresDia(w, dia) > 0;
}

/** La semana completa se puede elegir hasta el día en que parte, si quedan cupos todos los días. */
export function semanaCompletaAbierta(w: Semana, hoy = hoyChile()): boolean {
  return w.inicio >= hoy && libresSemana(w) > 0;
}

/** La semana todavía recibe inscripciones: completa o, si hay precio por día, en alguno de sus días. */
export function semanaAbierta(w: Semana, conDias: boolean, hoy = hoyChile()): boolean {
  if (conDias) return diasSemana(w).some((f) => diaAbierto(w, f, hoy));
  return semanaCompletaAbierta(w, hoy);
}

/** Semanas que todavía no terminan (con días sueltos) o no parten (solo semanas completas). */
export function semanasVigentes(s: Salida, hoy = hoyChile()): Semana[] {
  const conDias = porDia(s);
  return s.semanas.filter((w) => (conDias ? w.fin >= hoy : w.inicio >= hoy));
}

/**
 * Precio por niño de lo elegido en una semana. La semana completa cuesta lo que diga la semana,
 * salvo que por días salga más barato (por ejemplo, una semana corta de 3 días).
 * Unos pocos días cuestan el precio por día, sin pasarse del precio de la semana.
 */
export function precioEleccion(w: Pick<Semana, "inicio" | "fin" | "precio">, dias: number, precioDia: number | null): number {
  if (!precioDia) return dias === diasSemana(w).length ? w.precio : 0;
  return Math.min(w.precio, dias * precioDia);
}

/** Días que cubre una semana inscrita (las antiguas, sin `dias`, son la semana completa). */
export function diasInscritos(w: SemanaInscrita): string[] {
  return w.dias ?? diasSemana(w);
}

/** true si lo inscrito en esa semana es la semana completa. */
export function semanaCompleta(w: SemanaInscrita): boolean {
  return diasInscritos(w).length === diasSemana(w).length;
}

/** "Semana del 4 al 8 de enero" o, si son días sueltos, "4, 5 y 7 de enero". */
export function textoSemanaInscrita(w: SemanaInscrita): string {
  return semanaCompleta(w) ? `Semana del ${rangoDias(w.inicio, w.fin)}` : listaDias(diasInscritos(w));
}

/**
 * Cupos libres. En salidas por semanas: los del día (o la semana) con más espacio
 * (cuántos niños se pueden inscribir como máximo en alguna parte).
 */
export function cuposLibres(s: Salida): number {
  if (porDia(s)) {
    const hoy = hoyChile();
    return Math.max(0, ...semanasVigentes(s).flatMap((w) => diasSemana(w).filter((f) => f >= hoy).map((f) => libresDia(w, f))));
  }
  if (porSemanas(s)) return Math.max(0, ...semanasVigentes(s).map(libresSemana));
  return Math.max(0, s.cupos - s.cuposTomados);
}

/** Último día en que la salida aún puede recibir inscripciones (para listarla en el sitio). */
export function ultimoDia(s: Salida): string {
  if (porDia(s)) return s.semanas.reduce((m, w) => (w.fin > m ? w.fin : m), "");
  if (porSemanas(s)) return s.semanas.reduce((m, w) => (w.inicio > m ? w.inicio : m), "");
  return s.fecha;
}

/** Abierta = publicada, con fecha de hoy en adelante y con cupos. */
export function salidaAbierta(s: Salida): boolean {
  if (s.estado !== "publicada") return false;
  if (porSemanas(s)) return s.semanas.some((w) => semanaAbierta(w, porDia(s)));
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
