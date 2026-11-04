import "server-only";
import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { SITIO, urlSitio } from "./site";
import type { Inscripcion } from "./types";

export function pagoSimulado(): boolean {
  return process.env.PAGO_SIMULADO === "1" && process.env.VERCEL_ENV !== "production";
}

function cliente() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
}

export async function crearPreferencia(insc: Inscripcion): Promise<{ id: string; initPoint: string }> {
  const base = urlSitio();
  const https = base.startsWith("https://");
  const volver = `${base}/inscripcion/${insc.id}`;
  const pref = await new Preference(cliente()).create({
    body: {
      items: [
        {
          id: insc.salidaId,
          title: `${insc.salidaTitulo} (${insc.cantidad} ${insc.cantidad === 1 ? "niño" : "niños"})`,
          quantity: insc.cantidad,
          unit_price: insc.precioUnitario,
          currency_id: "CLP",
        },
      ],
      payer: { name: insc.apoderado.nombre, email: insc.apoderado.email },
      external_reference: insc.id,
      back_urls: { success: volver, pending: volver, failure: volver },
      ...(https ? { auto_return: "approved", notification_url: `${base}/api/mercadopago/webhook` } : {}),
      expires: true,
      expiration_date_to: new Date(insc.expiraEn).toISOString(),
      statement_descriptor: SITIO.nombre.slice(0, 22),
    },
    requestOptions: { idempotencyKey: insc.id },
  });
  if (!pref.id || !pref.init_point) throw new Error("Mercado Pago no devolvió el link de pago");
  return { id: pref.id, initPoint: pref.init_point };
}

export async function obtenerPago(id: string) {
  const p = await new Payment(cliente()).get({ id });
  return {
    id: String(p.id),
    status: p.status ?? "unknown",
    monto: p.transaction_amount ?? 0,
    referencia: p.external_reference ?? "",
  };
}

/**
 * Valida la firma x-signature de los webhooks de Mercado Pago.
 * https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
export function firmaValida(firma: string | null, requestId: string | null, dataId: string): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) return true; // Sin secreto configurado igual se consulta el pago a la API.
  if (!firma) return false;
  const partes = Object.fromEntries(
    firma.split(",").map((p) => p.trim().split("=", 2) as [string, string]),
  );
  if (!partes.ts || !partes.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifiesto = `id:${id};${requestId ? `request-id:${requestId};` : ""}ts:${partes.ts};`;
  const esperado = crypto.createHmac("sha256", secreto).update(manifiesto).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(partes.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
