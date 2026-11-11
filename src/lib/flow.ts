import "server-only";
import crypto from "node:crypto";
import { SITIO, urlSitio } from "./site";
import type { Inscripcion } from "./types";

/**
 * Integración con Flow (https://www.flow.cl/docs/api.html).
 *
 * Flujo:
 * 1. `crearPago` registra la orden en Flow y devuelve la URL a la que se redirige al apoderado.
 * 2. Flow avisa a `urlConfirmation` con un POST (form-urlencoded) que trae solo `token`.
 *    Ese aviso no viene firmado: siempre hay que consultar `obtenerEstado(token)` y creerle a esa respuesta.
 *    Hay que responder 200 en menos de 15 segundos.
 * 3. Al terminar, Flow devuelve al apoderado a `urlReturn` también con un POST (no GET) que trae `token`.
 */

/** Estados de un pago en Flow. */
export const ESTADO_FLOW = { pendiente: 1, pagado: 2, rechazado: 3, anulado: 4 } as const;
export type EstadoFlow = (typeof ESTADO_FLOW)[keyof typeof ESTADO_FLOW];

export function pagoSimulado(): boolean {
  return process.env.PAGO_SIMULADO === "1" && process.env.VERCEL_ENV !== "production";
}

function credenciales() {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error("Faltan FLOW_API_KEY o FLOW_SECRET_KEY");
  // Producción: https://www.flow.cl/api · Sandbox: https://sandbox.flow.cl/api
  const base = (process.env.FLOW_API_URL || "https://www.flow.cl/api").replace(/\/$/, "");
  return { apiKey, secretKey, base };
}

/** Firma de Flow: parámetros ordenados por nombre, concatenados como nombrevalor, HMAC-SHA256 en hex. */
export function firmar(params: Record<string, string>, secretKey: string): string {
  const texto = Object.keys(params)
    .sort()
    .map((k) => k + params[k])
    .join("");
  return crypto.createHmac("sha256", secretKey).update(texto).digest("hex");
}

async function llamar<T>(metodo: "GET" | "POST", ruta: string, datos: Record<string, string | number>): Promise<T> {
  const { apiKey, secretKey, base } = credenciales();
  const params: Record<string, string> = { apiKey };
  for (const [k, v] of Object.entries(datos)) params[k] = String(v);
  const cuerpo = new URLSearchParams({ ...params, s: firmar(params, secretKey) });

  const res = await fetch(metodo === "GET" ? `${base}${ruta}?${cuerpo}` : `${base}${ruta}`, {
    method: metodo,
    headers: metodo === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined,
    body: metodo === "POST" ? cuerpo : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const json = (await res.json().catch(() => null)) as (T & { code?: number; message?: string }) | null;
  if (!res.ok || !json) {
    throw new Error(`Flow ${ruta} respondió ${res.status}: ${json?.message ?? "sin detalle"}`);
  }
  return json;
}

/**
 * Crea la orden en Flow. `intento` se usa al reintentar después de un rechazo:
 * Flow exige un commerceOrder distinto por orden, así que se agrega como sufijo ("id.intento").
 */
export async function crearPago(
  insc: Inscripcion,
  intento?: string,
): Promise<{ token: string; flowOrder: number; url: string }> {
  const base = urlSitio();
  const segundosRestantes = Math.max(60, Math.floor((insc.expiraEn - Date.now()) / 1000));
  const r = await llamar<{ url: string; token: string; flowOrder: number }>("POST", "/payment/create", {
    // El id de la inscripción es único, así Flow rechaza una orden duplicada.
    commerceOrder: intento ? `${insc.id}.${intento}` : insc.id,
    subject: `${insc.salidaTitulo}${semanasTexto(insc)} (${insc.cantidad} ${insc.cantidad === 1 ? "niño" : "niños"}) · ${SITIO.nombre}`,
    currency: "CLP",
    amount: insc.total,
    email: insc.apoderado.email,
    paymentMethod: 9, // Todos los medios que tenga activos la cuenta
    urlConfirmation: `${base}/api/flow/confirmacion`,
    urlReturn: `${base}/api/flow/retorno?inscripcion=${encodeURIComponent(insc.id)}`,
    timeout: segundosRestantes,
  });
  if (!r.url || !r.token) throw new Error("Flow no devolvió el link de pago");
  return { token: r.token, flowOrder: r.flowOrder, url: `${r.url}?token=${r.token}` };
}

export async function obtenerEstado(token: string) {
  const r = await llamar<{
    flowOrder: number;
    commerceOrder: string;
    status: EstadoFlow;
    amount: number | string;
  }>("GET", "/payment/getStatus", { token });
  return {
    flowOrder: r.flowOrder,
    status: r.status,
    monto: Number(r.amount) || 0,
    /** id de la inscripción (sin el sufijo de reintento) */
    referencia: (r.commerceOrder ?? "").split(".")[0],
  };
}

function semanasTexto(insc: Inscripcion): string {
  const n = insc.semanas?.length ?? 0;
  return n ? `, ${n} ${n === 1 ? "semana" : "semanas"}` : "";
}
