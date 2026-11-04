import { haySesion } from "@/lib/auth";
import { inscripcionesDeSalida, obtenerSalida } from "@/lib/data";

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

  const filas = [
    ["Niño", "Edad", "Salud", "Apoderado", "RUT", "Teléfono", "Correo", "Emergencia", "Relación", "Tel. emergencia", "N.º inscripción"],
  ];
  for (const i of inscripciones.filter((x) => x.estado === "pagada")) {
    for (const n of i.ninos) {
      filas.push([
        n.nombre,
        String(n.edad),
        n.salud,
        i.apoderado.nombre,
        i.apoderado.rut,
        i.apoderado.telefono,
        i.apoderado.email,
        i.emergencia.nombre,
        i.emergencia.relacion,
        i.emergencia.telefono,
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
