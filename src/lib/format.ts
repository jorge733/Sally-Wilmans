const TZ = "America/Santiago";

export function hoyChile(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function clp(valor: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

/** "2026-11-21" -> "sábado 21 de noviembre" */
export function fechaLarga(fecha: string, conAnio = false): string {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(conAnio ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(dt);
}

export function fechaCorta(fecha: string): { dia: string; mes: string; semana: string } {
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-CL", { ...o, timeZone: "UTC" }).format(dt).replace(".", "");
  return { dia: String(d), mes: f({ month: "short" }), semana: f({ weekday: "short" }) };
}

export function fechaHora(ms: number): string {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TZ,
  }).format(new Date(ms));
}

export function edades(min: number, max: number): string {
  return min === max ? `${min} años` : `${min} a ${max} años`;
}

export function soloDigitos(v: string): string {
  return v.replace(/\D/g, "");
}

export function linkWhatsapp(numero: string, mensaje?: string): string {
  const n = soloDigitos(numero);
  return `https://wa.me/${n}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}

/** Fecha de una salida, o rango si dura varios días: "lunes 11 al viernes 15 de enero". */
export function fechaSalida(s: { fecha: string; fechaFin?: string | null }, conAnio = false): string {
  if (!s.fechaFin || s.fechaFin === s.fecha) return fechaLarga(s.fecha, conAnio);
  const ini = fechaLarga(s.fecha, conAnio).replace(",", "");
  const fin = fechaLarga(s.fechaFin, conAnio).replace(",", "");
  const [dIni, mIni] = [ini.split(" de ")[0], ini.split(" de ").slice(1).join(" de ")];
  return mIni === fin.split(" de ").slice(1).join(" de ") ? `${dIni} al ${fin}` : `${ini} al ${fin}`;
}
