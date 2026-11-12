"use server";

import { z } from "zod";
import { obtenerAjustes, obtenerInscripcion, obtenerSalida } from "@/lib/data";
import { crearPago, ESTADO_FLOW, pagoSimulado } from "@/lib/flow";
import { db } from "@/lib/firebase-admin";
import { edades, nombreNino, normalizarRut, rutValido } from "@/lib/format";
import { GRUPOS_SANGUINEOS } from "@/lib/types";
import { cancelarReserva, ErrorInscripcion, registrarPago, reservar } from "@/lib/inscripciones";

const texto = (max: number, mensaje: string) => z.string().trim().min(1, mensaje).max(max);

const esquema = z.object({
  salidaId: z.string().min(1).max(120),
  dias: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(150).default([]),
  ninos: z
    .array(
      z.object({
        nombre: texto(80, "Falta el nombre de un niño"),
        apellidoPaterno: texto(60, "Falta el primer apellido de un niño"),
        apellidoMaterno: texto(60, "Falta el segundo apellido de un niño"),
        rut: z
          .string()
          .trim()
          .refine(rutValido, "Revisa el RUT de cada niño")
          .transform(normalizarRut),
        edad: z.number().int().min(1).max(18),
        meses: z.number().int().min(0).max(11),
        alergias: texto(500, "Indica si cada niño tiene alergias (o escribe «ninguna»)"),
        grupoSanguineo: z.enum([...GRUPOS_SANGUINEOS, ""]).default(""),
        salud: texto(1000, "Indica si cada niño tiene alguna enfermedad o condición (o escribe «ninguna»)"),
      }),
    )
    .min(1, "Agrega al menos un niño")
    .max(5, "Máximo 5 niños por inscripción"),
  apoderado: z.object({
    nombre: texto(120, "Falta el nombre del apoderado"),
    rut: z
      .string()
      .trim()
      .regex(/^[0-9.]{7,12}-?[0-9kK]$/, "Revisa el RUT del apoderado"),
    email: z.email("Revisa el correo del apoderado").max(160),
    telefono: texto(30, "Falta el teléfono del apoderado"),
  }),
  emergencia: z.object({
    nombre: texto(120, "Falta el nombre del contacto de emergencia"),
    telefono: texto(30, "Falta el teléfono del contacto de emergencia"),
    relacion: texto(60, "Indica la relación del contacto de emergencia"),
  }),
  retiro: z.object({
    nombre: texto(120, "Falta el nombre de quien retira a los niños"),
    telefono: texto(30, "Falta el teléfono de quien retira a los niños"),
  }),
  centroMedico: texto(160, "Indica a qué centro médico llevarlos en caso de accidente"),
  comentarios: z.string().trim().max(2000).default(""),
  autoriza: z.boolean().refine((v) => v, "Debes aceptar la autorización"),
});

export type DatosFicha = z.input<typeof esquema>;

export type ResultadoInscripcion =
  | { ok: true; inscripcionId: string; urlPago: string | null }
  | { ok: false; error: string };

/**
 * Reserva el cupo y crea el pago en Flow.
 * Devuelve la URL de Flow a la que hay que mandar al apoderado
 * (o `urlPago: null` cuando el pago está simulado en desarrollo).
 */
export async function iniciarInscripcion(datos: DatosFicha): Promise<ResultadoInscripcion> {
  const r = esquema.safeParse(datos);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Revisa los datos de la ficha" };
  const d = r.data;

  const [salida, ajustes] = await Promise.all([obtenerSalida(d.salidaId), obtenerAjustes()]);
  if (!salida) return { ok: false, error: "La salida no existe." };
  const fuera = d.ninos.find((n) => n.edad < salida.edadMin || n.edad > salida.edadMax);
  if (fuera) {
    return {
      ok: false,
      error: `${nombreNino(fuera)} no está en el rango de edad de esta salida (${edades(salida.edadMin, salida.edadMax)}).`,
    };
  }

  let inscripcionId: string | null = null;
  try {
    const insc = await reservar({
      salidaId: salida.id,
      apoderado: { ...d.apoderado, email: d.apoderado.email.toLowerCase() },
      emergencia: d.emergencia,
      retiro: d.retiro,
      centroMedico: d.centroMedico,
      comentarios: d.comentarios,
      ninos: d.ninos,
      dias: d.dias,
      textoAutorizacion: ajustes.textoAutorizacion,
    });
    inscripcionId = insc.id;

    if (pagoSimulado()) return { ok: true, inscripcionId, urlPago: null };

    const pago = await crearPago(insc);
    await db.collection("inscripciones").doc(insc.id).update({
      "flow.token": pago.token,
      "flow.flowOrder": pago.flowOrder,
      "flow.url": pago.url,
      "flow.status": ESTADO_FLOW.pendiente,
    });
    return { ok: true, inscripcionId, urlPago: pago.url };
  } catch (e) {
    if (e instanceof ErrorInscripcion) return { ok: false, error: e.message };
    console.error("No se pudo iniciar la inscripción", e);
    // Si la reserva alcanzó a crearse, se libera el cupo para no dejarlo tomado sin pago.
    if (inscripcionId) await cancelarReserva(inscripcionId).catch(() => {});
    return { ok: false, error: "No pudimos conectar con el sistema de pago. Intenta de nuevo en unos minutos." };
  }
}

/** Crea un nuevo pago en Flow para una inscripción pendiente cuyo pago anterior fue rechazado. */
export async function reintentarPago(inscripcionId: string): Promise<ResultadoInscripcion> {
  const insc = await obtenerInscripcion(inscripcionId);
  if (!insc || insc.estado !== "pendiente" || !insc.cupoReservado || insc.expiraEn < Date.now()) {
    return { ok: false, error: "Esta reserva ya no está vigente. Vuelve a inscribir desde la salida." };
  }
  if (pagoSimulado()) return { ok: true, inscripcionId, urlPago: null };
  try {
    const pago = await crearPago(insc, Date.now().toString(36));
    await db.collection("inscripciones").doc(insc.id).update({
      "flow.token": pago.token,
      "flow.flowOrder": pago.flowOrder,
      "flow.url": pago.url,
      "flow.status": ESTADO_FLOW.pendiente,
    });
    return { ok: true, inscripcionId, urlPago: pago.url };
  } catch (e) {
    console.error("No se pudo reintentar el pago", e);
    return { ok: false, error: "No pudimos conectar con el sistema de pago. Intenta de nuevo en unos minutos." };
  }
}

/** Solo en desarrollo con PAGO_SIMULADO=1: marca la inscripción como pagada sin pasar por Flow. */
export async function simularPago(inscripcionId: string): Promise<{ ok: boolean }> {
  if (!pagoSimulado()) return { ok: false };
  const insc = await obtenerInscripcion(inscripcionId);
  if (!insc) return { ok: false };
  await registrarPago(insc.id, { flowOrder: 0, status: ESTADO_FLOW.pagado, monto: insc.total });
  return { ok: true };
}
