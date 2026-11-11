import "server-only";
import { Resend } from "resend";
import { obtenerAjustes } from "./data";
import { clp, edades, fechaSalida } from "./format";
import { SITIO } from "./site";
import type { Inscripcion, Salida } from "./types";

let cliente: Resend | null | undefined;
function resend(): Resend | null {
  if (cliente === undefined) cliente = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  return cliente;
}

/**
 * Envía un correo con Resend. `clave` evita duplicados: si Flow avisa dos veces o
 * se reintenta tras un error, Resend no vuelve a mandar el mismo correo (24 h).
 */
async function enviar(para: string, asunto: string, html: string, clave: string, replyTo?: string) {
  const r = resend();
  if (!r) {
    console.info(`[correo sin RESEND_API_KEY] Para: ${para} · ${asunto}`);
    return;
  }
  const { error } = await r.emails.send(
    {
      from: process.env.EMAIL_FROM || `${SITIO.nombre} <onboarding@resend.dev>`,
      to: para,
      subject: asunto,
      html,
      replyTo,
    },
    { idempotencyKey: clave },
  );
  // Misma clave con otro contenido (p. ej. cambió el conteo de cupos): ese correo ya salió antes.
  if (error?.name === "invalid_idempotent_request") return;
  if (error) throw new Error(`Resend: ${error.name} · ${error.message}`);
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function marco(titulo: string, cuerpo: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f3eddf;font-family:Arial,Helvetica,sans-serif;color:#23291f">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#2f4a34;color:#fff;border-radius:10px 10px 0 0;padding:20px 24px">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d5dfcc">${SITIO.nombre}</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px">${titulo}</div>
    </div>
    <div style="background:#fff;border-radius:0 0 10px 10px;padding:24px;line-height:1.55;font-size:15px">${cuerpo}</div>
  </div></body></html>`;
}

function filas(pares: [string, string][]): string {
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0">${pares
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#5f6656;width:40%;vertical-align:top">${k}</td><td style="padding:6px 0;font-weight:bold">${v}</td></tr>`,
    )
    .join("")}</table>`;
}

export async function enviarAvisosInscripcion(insc: Inscripcion, salida: Salida): Promise<void> {
  const ajustes = await obtenerAjustes();
  const ninos = insc.ninos.map((n) => `${esc(n.nombre)} (${n.edad} años)`).join("<br>");
  const detalle = filas([
    ["Salida", esc(salida.titulo)],
    ["Fecha", fechaSalida(salida, true)],
    ["Horario", `${salida.horaInicio} a ${salida.horaFin} h`],
    ["Lugar", esc(salida.lugar)],
    ["Punto de encuentro", esc(salida.puntoEncuentro || "Se avisará por WhatsApp")],
    ["Inscritos", ninos],
    ["Total pagado", clp(insc.total)],
    ["N.º de inscripción", insc.id],
  ]);
  const llevar = salida.queLlevar.length
    ? `<h3 style="margin:20px 0 6px;font-size:16px">Qué deben llevar</h3><ul style="margin:0;padding-left:20px">${salida.queLlevar
        .map((x) => `<li>${esc(x)}</li>`)
        .join("")}</ul>`
    : "";
  const contacto = ajustes.whatsapp
    ? `<p style="margin-top:20px">¿Dudas? Escríbenos por WhatsApp al <b>+${esc(ajustes.whatsapp.replace(/\D/g, ""))}</b>.</p>`
    : "";

  const apoderado = marco(
    "¡Inscripción confirmada!",
    `<p>Hola ${esc(insc.apoderado.nombre.split(" ")[0])}, recibimos tu pago. Este es tu comprobante:</p>${detalle}${llevar}${contacto}<p>Nos vemos en la montaña.<br>${SITIO.nombre}</p>`,
  );

  const fichas = insc.ninos
    .map((n) => `<li><b>${esc(n.nombre)}</b>, ${n.edad} años. Salud: ${esc(n.salud || "Sin observaciones")}</li>`)
    .join("");
  const aviso = marco(
    "Nueva inscripción pagada",
    `${filas([
      ["Salida", `${esc(salida.titulo)} · ${fechaSalida(salida)}`],
      ["Apoderado", `${esc(insc.apoderado.nombre)}<br>${esc(insc.apoderado.telefono)}<br>${esc(insc.apoderado.email)}`],
      ["Emergencia", `${esc(insc.emergencia.nombre)} (${esc(insc.emergencia.relacion)})<br>${esc(insc.emergencia.telefono)}`],
      ["Total", clp(insc.total)],
      ["Cupos", `${salida.cuposTomados} de ${salida.cupos} tomados`],
    ])}<ul style="padding-left:20px">${fichas}</ul>${
      insc.sobrecupo
        ? `<p style="color:#c0663a;font-weight:bold">Atención: este pago llegó después de que venció la reserva y la salida ya estaba llena. Revisa los cupos en el panel.</p>`
        : ""
    }<p style="color:#5f6656;font-size:13px">Edades de la salida: ${edades(salida.edadMin, salida.edadMax)}</p>`,
  );

  const avisoA = process.env.ADMIN_NOTIFY_EMAIL || ajustes.email;
  await Promise.all([
    enviar(insc.apoderado.email, `Inscripción confirmada: ${salida.titulo}`, apoderado, `insc-${insc.id}-apoderado`, ajustes.email || undefined),
    avisoA ? enviar(avisoA, `Nueva inscripción: ${salida.titulo} (${insc.cantidad})`, aviso, `insc-${insc.id}-aviso`, insc.apoderado.email) : null,
  ]);
}
