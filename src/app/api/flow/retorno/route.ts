import { obtenerEstado } from "@/lib/flow";
import { registrarPago } from "@/lib/inscripciones";
import { urlSitio } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Flow devuelve aquí al apoderado al terminar (o abandonar) el pago, con un POST que trae `token`.
 * Se consulta el estado por si la confirmación todavía no llegó, y se redirige a la página
 * de la inscripción con 303 para que el navegador la abra con GET.
 */
async function volver(req: Request, token: string | null) {
  const idUrl = new URL(req.url).searchParams.get("inscripcion") ?? "";
  let id = idUrl;
  if (token) {
    try {
      const pago = await obtenerEstado(token);
      if (pago.referencia) {
        id = pago.referencia;
        await registrarPago(pago.referencia, pago);
      }
    } catch (e) {
      // La confirmación de Flow igual llega por /api/flow/confirmacion.
      console.error("No se pudo consultar el pago al volver de Flow", e);
    }
  }
  const destino = /^[A-Za-z0-9_-]{1,64}$/.test(id) ? `/inscripcion/${id}` : "/";
  return Response.redirect(`${urlSitio()}${destino}`, 303);
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const token = form?.get("token");
  return volver(req, typeof token === "string" ? token : null);
}

export async function GET(req: Request) {
  return volver(req, new URL(req.url).searchParams.get("token"));
}
