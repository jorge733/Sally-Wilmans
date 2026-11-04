import Link from "next/link";
import { notFound } from "next/navigation";
import { inscripcionesDeSalida, obtenerSalida } from "@/lib/data";
import { clp, edades, fechaHora, fechaSalida } from "@/lib/format";
import { BotonImprimir } from "./BotonImprimir";

export const metadata = { title: "Inscritos" };

type Props = { params: Promise<{ id: string }> };

export default async function Inscritos({ params }: Props) {
  const { id } = await params;
  const [salida, todas] = await Promise.all([obtenerSalida(id), inscripcionesDeSalida(id)]);
  if (!salida) notFound();
  const pagadas = todas.filter((i) => i.estado === "pagada");
  const pendientes = todas.filter((i) => i.estado === "pendiente" && i.expiraEn > Date.now());
  const ninos = pagadas.flatMap((i) => i.ninos.map((n) => ({ ...n, insc: i })));
  const conSalud = ninos.filter((n) => n.salud && !/^(ninguna?|no|sin|-|n\/a)\.?$/i.test(n.salud.trim()));

  return (
    <>
      <Link href={`/admin/salidas/${id}`} className="no-print text-sm font-medium text-gris hover:text-tinta">
        ← {salida.titulo}
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-marca">Inscritos</h1>
          <p className="mt-1 text-gris first-letter:uppercase">
            {salida.titulo} · {fechaSalida(salida, true)} · {salida.horaInicio} a {salida.horaFin} h ·{" "}
            {edades(salida.edadMin, salida.edadMax)}
          </p>
        </div>
        <div className="no-print flex gap-2">
          <a href={`/admin/salidas/${id}/inscritos/csv`} className="btn btn-secundario px-4 py-2 text-sm text-marca">
            Descargar planilla
          </a>
          <BotonImprimir />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Niños inscritos", `${ninos.length}`],
          ["Cupos", `${salida.cuposTomados} / ${salida.cupos}`],
          ["Con datos de salud", `${conSalud.length}`],
          ["Recaudado", clp(pagadas.reduce((t, i) => t + i.total, 0))],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4">
            <dt className="text-xs font-semibold tracking-wider text-gris uppercase">{k}</dt>
            <dd className="mt-1 text-2xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      {conSalud.length > 0 && (
        <section className="mt-6 rounded-2xl border-2 border-acento/40 bg-white p-5">
          <h2 className="font-semibold text-acento">Atención: datos de salud</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {conSalud.map((n, i) => (
              <li key={i}>
                <b>{n.nombre}</b> ({n.edad}): {n.salud}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ninos.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-linea bg-white p-10 text-center text-gris">
          Todavía no hay inscripciones pagadas en esta salida.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-linea text-xs tracking-wider text-gris uppercase">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Niño o niña</th>
                <th className="p-3">Salud</th>
                <th className="p-3">Apoderado</th>
                <th className="p-3">Emergencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linea">
              {ninos.map((n, i) => (
                <tr key={i} className="align-top">
                  <td className="p-3 text-gris">{i + 1}</td>
                  <td className="p-3">
                    <b>{n.nombre}</b>
                    <div className="text-gris">{n.edad} años</div>
                  </td>
                  <td className="p-3">{n.salud || "—"}</td>
                  <td className="p-3">
                    {n.insc.apoderado.nombre}
                    <div className="text-gris">
                      <a href={`tel:${n.insc.apoderado.telefono}`}>{n.insc.apoderado.telefono}</a>
                    </div>
                    <div className="text-gris">{n.insc.apoderado.email}</div>
                  </td>
                  <td className="p-3">
                    {n.insc.emergencia.nombre} ({n.insc.emergencia.relacion})
                    <div className="text-gris">
                      <a href={`tel:${n.insc.emergencia.telefono}`}>{n.insc.emergencia.telefono}</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendientes.length > 0 && (
        <p className="no-print mt-4 text-sm text-gris">
          Hay {pendientes.length} inscripción(es) esperando pago. Su cupo queda guardado hasta{" "}
          {fechaHora(Math.max(...pendientes.map((p) => p.expiraEn)))}; si no pagan, se libera solo.
        </p>
      )}
    </>
  );
}
