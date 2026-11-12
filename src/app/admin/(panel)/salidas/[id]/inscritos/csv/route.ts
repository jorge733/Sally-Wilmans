import { haySesion } from "@/lib/auth";
import { inscripcionesDeSalida, obtenerSalida } from "@/lib/data";
import { listaDias, rangoDias } from "@/lib/format";
import { diasInscritos, semanaCompleta, textoSemanaInscrita } from "@/lib/salida-utils";

const celda = (v: unknown) => {
  const s = String(v ?? "");
  // Evita que Excel interprete fórmulas (=, @, o +/- que no sea un teléfono) y escapa comillas.
  const seguro = /^(=|@|[+-](?![\d\s()]+$))/.test(s) ? `'${s}` : s;
  return `"${seguro.replace(/"/g, '""')}"`;
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await haySesion())) return new Response("No autorizado", { status: 401 });
  const { id } = await params;
  const [salida, inscripciones] = await Promise.all([obtenerSalida(id), inscripcionesDeSalida(id)]);
  if (!salida) return new Response("No existe", { status: 404 });

  const conSemanas = salida.semanas.length > 0;
  // Una columna por semana (X si va la semana completa, o los días que va), para poder filtrar en Excel.
  const columnasSemanas = salida.semanas.map((w) => `Semana ${rangoDias(w.inicio, w.fin)}`);
  const filas = [
    [
      "Nombres",
      "Primer apellido",
      "Segundo apellido",
      "RUT niño",
      "Años",
      "Meses",
      ...(conSemanas ? ["Fechas", ...columnasSemanas] : []),
      "Alergias",
      "Enfermedades o condiciones",
      "Grupo sanguíneo",
      "Centro médico",
      "Retira",
      "Tel. retira",
      "Apoderado",
      "RUT apoderado",
      "Teléfono",
      "Correo",
      "Emergencia",
      "Relación",
      "Tel. emergencia",
      "Comentarios",
      "N.º inscripción",
    ],
  ];
  for (const i of inscripciones.filter((x) => x.estado === "pagada")) {
    for (const n of i.ninos) {
      filas.push([
        n.nombre,
        n.apellidoPaterno ?? "",
        n.apellidoMaterno ?? "",
        n.rut ?? "",
        String(n.edad),
        String(n.meses ?? ""),
        ...(conSemanas
          ? [
              (i.semanas ?? []).map(textoSemanaInscrita).join(" · "),
              ...salida.semanas.map((w) => {
                const elegida = i.semanas?.find((x) => x.id === w.id);
                if (!elegida) return "";
                return semanaCompleta(elegida) ? "X" : listaDias(diasInscritos(elegida));
              }),
            ]
          : []),
        n.alergias ?? "",
        n.salud,
        n.grupoSanguineo ?? "",
        i.centroMedico ?? "",
        i.retiro?.nombre ?? "",
        i.retiro?.telefono ?? "",
        i.apoderado.nombre,
        i.apoderado.rut,
        i.apoderado.telefono,
        i.apoderado.email,
        i.emergencia.nombre,
        i.emergencia.relacion,
        i.emergencia.telefono,
        i.comentarios ?? "",
        i.id,
      ]);
    }
  }
  // BOM + punto y coma para que Excel en español lo abra bien.
  const csv = "﻿" + filas.map((f) => f.map(celda).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscritos-${id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
