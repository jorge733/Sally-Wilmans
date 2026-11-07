import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import { aInscripcion, aSalida } from "./data";
import { cuposLibres, salidaAbierta } from "./salida-utils";
import { enviarAvisosInscripcion } from "./email";
import { ESTADO_FLOW, type EstadoFlow } from "./flow";
import type { Inscripcion, Nino } from "./types";

/** Minutos que se guarda el cupo mientras el apoderado paga. */
export const MINUTOS_RESERVA = 30;

export class ErrorInscripcion extends Error {}

export interface DatosInscripcion {
  salidaId: string;
  apoderado: Inscripcion["apoderado"];
  emergencia: Inscripcion["emergencia"];
  ninos: Nino[];
  textoAutorizacion: string;
}

/**
 * Libera los cupos de reservas pendientes que ya vencieron.
 * Se llama antes de reservar y al abrir el panel, así no hace falta un cron.
 */
export async function liberarReservasVencidas(salidaId: string): Promise<void> {
  const ahora = Date.now();
  const pendientes = await db
    .collection("inscripciones")
    .where("salidaId", "==", salidaId)
    .where("estado", "==", "pendiente")
    .get();
  const vencidas = pendientes.docs.filter((d) => (d.get("expiraEn") ?? 0) < ahora);
  for (const doc of vencidas) {
    await db.runTransaction(async (tx) => {
      const fresca = await tx.get(doc.ref);
      if (fresca.get("estado") !== "pendiente" || !fresca.get("cupoReservado")) return;
      tx.update(doc.ref, { estado: "expirada", cupoReservado: false });
      tx.update(db.collection("salidas").doc(salidaId), {
        cuposTomados: FieldValue.increment(-fresca.get("cantidad")),
      });
    });
  }
}

/** Crea la inscripción y descuenta el cupo de forma atómica. */
export async function reservar(datos: DatosInscripcion): Promise<Inscripcion> {
  await liberarReservasVencidas(datos.salidaId);

  const salidaRef = db.collection("salidas").doc(datos.salidaId);
  const inscRef = db.collection("inscripciones").doc();
  const cantidad = datos.ninos.length;

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(salidaRef);
    if (!snap.exists) throw new ErrorInscripcion("La salida no existe.");
    const salida = aSalida(snap);
    if (!salidaAbierta(salida)) throw new ErrorInscripcion("Esta salida ya no recibe inscripciones.");
    const libres = cuposLibres(salida);
    if (cantidad > libres) {
      throw new ErrorInscripcion(
        libres === 1 ? "Solo queda 1 cupo en esta salida." : `Solo quedan ${libres} cupos en esta salida.`,
      );
    }

    const ahora = Date.now();
    const insc: Omit<Inscripcion, "id"> = {
      salidaId: salida.id,
      salidaTitulo: salida.titulo,
      salidaFecha: salida.fecha,
      apoderado: datos.apoderado,
      emergencia: datos.emergencia,
      ninos: datos.ninos,
      autorizacion: { aceptada: true, texto: datos.textoAutorizacion, fecha: ahora },
      cantidad,
      precioUnitario: salida.precio,
      total: salida.precio * cantidad,
      estado: "pendiente",
      cupoReservado: true,
      sobrecupo: false,
      flow: { token: null, flowOrder: null, url: null, status: null },
      avisosEnviados: false,
      creadoEn: ahora,
      expiraEn: ahora + MINUTOS_RESERVA * 60_000,
      pagadoEn: null,
    };
    tx.set(inscRef, insc);
    tx.update(salidaRef, { cuposTomados: FieldValue.increment(cantidad) });
    return { id: inscRef.id, ...insc };
  });
}

/** Deshace una reserva que no alcanzó a llegar a Flow (por ejemplo, si Flow no respondió). */
export async function cancelarReserva(inscripcionId: string): Promise<void> {
  const ref = db.collection("inscripciones").doc(inscripcionId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("estado") !== "pendiente" || !snap.get("cupoReservado")) return;
    tx.update(ref, { estado: "expirada", cupoReservado: false });
    tx.update(db.collection("salidas").doc(snap.get("salidaId")), {
      cuposTomados: FieldValue.increment(-snap.get("cantidad")),
    });
  });
}

/**
 * Registra el resultado de un pago de Flow (según `obtenerEstado`). Es idempotente:
 * Flow puede avisar varias veces el mismo pago, y el retorno del apoderado también lo consulta.
 */
export async function registrarPago(
  inscripcionId: string,
  pago: { flowOrder: number; status: EstadoFlow; monto: number },
): Promise<void> {
  const ref = db.collection("inscripciones").doc(inscripcionId);
  let enviarAvisos = false;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const insc = aInscripcion(snap);
    const salidaRef = db.collection("salidas").doc(insc.salidaId);
    const salidaSnap = await tx.get(salidaRef);

    // Un aviso tardío de un intento anterior rechazado no debe pisar los datos del pago que sí se aprobó.
    const avisoViejo =
      insc.estado === "pagada" && pago.status !== ESTADO_FLOW.pagado && pago.status !== ESTADO_FLOW.anulado;
    const cambios: Record<string, unknown> = avisoViejo
      ? {}
      : { "flow.flowOrder": pago.flowOrder, "flow.status": pago.status };

    if (pago.status === ESTADO_FLOW.pagado) {
      if (insc.estado !== "pagada") {
        cambios.estado = "pagada";
        cambios.pagadoEn = Date.now();
        if (pago.monto < insc.total) cambios.montoIncompleto = true;
        if (!insc.cupoReservado) {
          // Pagó después de que venció la reserva: se vuelve a tomar el cupo.
          const libres = salidaSnap.exists ? cuposLibres(aSalida(salidaSnap)) : 0;
          cambios.cupoReservado = true;
          cambios.sobrecupo = libres < insc.cantidad;
          tx.update(salidaRef, { cuposTomados: FieldValue.increment(insc.cantidad) });
        }
      }
      if (!insc.avisosEnviados) {
        cambios.avisosEnviados = true;
        enviarAvisos = true;
      }
    } else if (pago.status === ESTADO_FLOW.rechazado || pago.status === ESTADO_FLOW.anulado) {
      // Un pago rechazado no anula la reserva: el apoderado puede reintentar hasta que venza.
      if (insc.estado === "pagada" && pago.status === ESTADO_FLOW.anulado) {
        cambios.estado = "anulada";
        if (insc.cupoReservado) {
          cambios.cupoReservado = false;
          tx.update(salidaRef, { cuposTomados: FieldValue.increment(-insc.cantidad) });
        }
      } else if (insc.estado === "pendiente") {
        cambios.estado = "pendiente";
      }
    }
    if (Object.keys(cambios).length) tx.update(ref, cambios);
  });

  if (enviarAvisos) {
    const final = await ref.get();
    const salida = await db.collection("salidas").doc(final.get("salidaId")).get();
    try {
      await enviarAvisosInscripcion(aInscripcion(final), aSalida(salida));
    } catch (e) {
      console.error("No se pudieron enviar los avisos", e);
      await ref.update({ avisosEnviados: false });
    }
  }
}
