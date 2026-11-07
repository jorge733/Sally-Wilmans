import { obtenerEstado } from "@/lib/flow";
import { registrarPago } from "@/lib/inscripciones";

export const dynamic = "force-dynamic";

/**
 * Flow avisa aquí cada cambio de un pago (POST form-urlencoded con `token`).
 * El aviso no viene firmado, así que el estado se consulta siempre a la API de Flow.
 * Si respondemos con error, Flow vuelve a intentar.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !token) return new Response("Falta token", { status: 400 });

  try {
    const pago = await obtenerEstado(token);
    if (!pago.referencia) return new Response("Orden sin referencia", { status: 400 });
    await registrarPago(pago.referencia, pago);
    return new Response("ok");
  } catch (e) {
    console.error("Confirmación de Flow falló", e);
    return new Response("Error", { status: 500 });
  }
}
