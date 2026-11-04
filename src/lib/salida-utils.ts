import { hoyChile } from "./format";
import type { Salida } from "./types";

export function cuposLibres(s: Salida): number {
  return Math.max(0, s.cupos - s.cuposTomados);
}

/** Abierta = publicada, con fecha de hoy en adelante y con cupos. */
export function salidaAbierta(s: Salida): boolean {
  return s.estado === "publicada" && s.fecha >= hoyChile() && cuposLibres(s) > 0;
}
