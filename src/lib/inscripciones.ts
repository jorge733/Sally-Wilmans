import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import { aInscripcion, aSalida } from "./data";
import { rangoDias } from "./format";
import { cuposLibres, libresSemana, porSemanas, salidaAbierta, semanaAbierta } from "./salida-utils";
import { enviarAvisosInscripcion } from "./email";
import { ESTADO_FLOW, type EstadoFlow } from "./flow";
import type { Inscripcion, Nino, SemanaInscrita } from "./types";

type Doc = FirebaseFirestore.DocumentSnapshot;

/** Minutos que se guarda el cupo mientras el apoderado paga. */
export const MINUTOS_RESERVA = 30;

export class ErrorInscripcion extends Error {}

export interface DatosInscripcion {
  salidaId: string;
  apoderado: Inscripcion["apoderado"];
  emergencia: Inscripcion["emergencia"];
  ninos: Nino[];
  /** Ids de las semanas elegidas (solo en salidas por semanas) */
  semanas: string[];
  textoAutorizacion: string;
}

/**
 * Cambios en la salida para tomar (signo 1) o devolver (signo -1) los cupos de una inscripción.
 * En salidas por semanas se mueve el cupo de cada semana elegida (y el total, que es la suma).
 */
function cambiosCupos(
  salidaSnap: Doc,
  insc: { cantidad: number; semanas?: SemanaInscrita[] },
  signo: 1 | -1,
): Record<string, unknown> {
  const delta = signo * insc.cantidad;
  if (!insc.semanas?.length) return { cuposTomados: FieldValue.increment(delta) };
  const ids = new Set(insc.semanas.map((w) => w.id));
  const semanas = aSalida(salidaSnap).semanas.map((w) =>
    ids.has(w.id) ? { ...w, cuposTomados: Math.max(0, w.cuposTomados + delta) } : w,
  );
  return { semanas, cuposTomados: semanas.reduce((t, w) => t + w.cuposTomados, 0) };
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
      const salidaRef = db.collection("salidas").doc(salidaId);
      const salidaSnap = await tx.get(salidaRef);
      tx.update(doc.ref, { estado: "expirada", cupoReservado: false });
      if (salidaSnap.exists) tx.update(salidaRef, cambiosCupos(salidaSnap, aInscripcion(fresca), -1));
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

    let semanas: SemanaInscrita[] | undefined;
    let precioUnitario = salida.precio;
    if (porSemanas(salida)) {
      const elegidas = salida.semanas.filter((w) => datos.semanas.includes(w.id));
      if (!elegidas.length || elegidas.length !== new Set(datos.semanas).size) {
        throw new ErrorInscripcion("Elige al menos una semana.");
      }
      for (const w of elegidas) {
        const libres = libresSemana(w);
        if (!semanaAbierta(w)) throw new ErrorInscripcion(`La semana del ${rangoDias(w.inicio, w.fin)} ya no recibe inscripciones.`);
        if (cantidad > libres) {
          throw new ErrorInscripcion(
            `En la semana del ${rangoDias(w.inicio, w.fin)} ${libres === 1 ? "solo queda 1 cupo" : `solo quedan ${libres} cupos`}.`,
          );
        }
      }
      semanas = elegidas.map(({ id, inicio, fin, precio }) => ({ id, inicio, fin, precio }));
      precioUnitario = semanas.reduce((t, w) => t + w.precio, 0);
    } else {
      const libres = cuposLibres(salida);
      if (cantidad > libres) {
        throw new ErrorInscripcion(
          libres === 1 ? "Solo queda 1 cupo en esta salida." : `Solo quedan ${libres} cupos en esta salida.`,
        );
      }
    }

    const ahora = Date.now();
    const insc: Omit<Inscripcion, "id"> = {
      salidaId: salida.id,
      salidaTitulo: salida.titulo,
      salidaFecha: semanas?.[0]?.inicio ?? salida.fecha,
      apoderado: datos.apoderado,
      emergencia: datos.emergencia,
      ninos: datos.ninos,
      ...(semanas ? { semanas } : {}),
      autorizacion: { aceptada: true, texto: datos.textoAutorizacion, fecha: ahora },
      cantidad,
      precioUnitario,
      total: precioUnitario * cantidad,
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
    tx.update(salidaRef, cambiosCupos(snap, { cantidad, semanas }, 1));
    return { id: inscRef.id, ...insc };
  });
}

/** true si ya no caben los niños de la inscripción (en la salida o en alguna de sus semanas). */
function hayMenosCupos(salida: ReturnType<typeof aSalida>, insc: Inscripcion): boolean {
  if (!insc.semanas?.length) return Math.max(0, salida.cupos - salida.cuposTomados) < insc.cantidad;
  return insc.semanas.some((elegida) => {
    const w = salida.semanas.find((x) => x.id === elegida.id);
    return !w || libresSemana(w) < insc.cantidad;
  });
}

/** Deshace una reserva que no alcanzó a llegar a Flow (por ejemplo, si Flow no respondió). */
export async function cancelarReserva(inscripcionId: string): Promise<void> {
  const ref = db.collection("inscripciones").doc(inscripcionId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("estado") !== "pendiente" || !snap.get("cupoReservado")) return;
    const salidaRef = db.collection("salidas").doc(snap.get("salidaId"));
    const salidaSnap = await tx.get(salidaRef);
    tx.update(ref, { estado: "expirada", cupoReservado: false });
    if (salidaSnap.exists) tx.update(salidaRef, cambiosCupos(salidaSnap, aInscripcion(snap), -1));
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
          cambios.cupoReservado = true;
          cambios.sobrecupo = !salidaSnap.exists || hayMenosCupos(aSalida(salidaSnap), insc);
          if (salidaSnap.exists) tx.update(salidaRef, cambiosCupos(salidaSnap, insc, 1));
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
          if (salidaSnap.exists) tx.update(salidaRef, cambiosCupos(salidaSnap, insc, -1));
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
