import Link from "next/link";
import { notFound } from "next/navigation";
import { inscripcionesDeSalida, obtenerSalida } from "@/lib/data";
import { clp, edadNino, edades, fechaHora, fechaLarga, fechaSalida, hayDato, nombreNino, rangoDias } from "@/lib/format";
import { diasInscritos, diasSemana, semanaCompleta, textoSemanaInscrita, tomadosEn } from "@/lib/salida-utils";
import { BotonImprimir } from "./BotonImprimir";

export const metadata = { title: "Inscritos" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ semana?: string; dia?: string }> };

export default async function Inscritos({ params, searchParams }: Props) {
  const [{ id }, { semana: semanaId, dia: diaPedido }] = await Promise.all([params, searchParams]);
  const [salida, todas] = await Promise.all([obtenerSalida(id), inscripcionesDeSalida(id)]);
  if (!salida) notFound();
  const semana = salida.semanas.find((w) => w.id === semanaId);
  const dia = semana && diaPedido && diasSemana(semana).includes(diaPedido) ? diaPedido : null;
  const enSemana = (i: (typeof todas)[number]) => {
    if (!semana) return true;
    const elegida = i.semanas?.find((w) => w.id === semana.id);
    return Boolean(elegida && (!dia || diasInscritos(elegida).includes(dia)));
  };
  /** Lo que eligió la inscripción en la semana filtrada. */
  const eleccionSemana = (i: (typeof todas)[number]) => (semana ? i.semanas?.find((w) => w.id === semana.id) : undefined);
  const pagadas = todas.filter((i) => i.estado === "pagada" && enSemana(i));
  const pendientes = todas.filter((i) => i.estado === "pendiente" && i.expiraEn > Date.now() && enSemana(i));
  const nombreSemana = (w: { inicio: string; fin: string }) => rangoDias(w.inicio, w.fin);
  const ninos = pagadas.flatMap((i) => i.ninos.map((n) => ({ ...n, insc: i })));
  const conSalud = ninos.filter((n) => hayDato(n.salud) || hayDato(n.alergias));
  const conComentarios = pagadas.filter((i) => hayDato(i.comentarios));

  return (
    <>
      <Link href={`/admin/salidas/${id}`} className="no-print text-sm font-medium text-gris hover:text-tinta">
        ← {salida.titulo}
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-marca">Inscritos</h1>
          <p className="mt-1 text-gris first-letter:uppercase">
            {salida.titulo} · {dia ? fechaLarga(dia, true) : semana ? `Semana del ${nombreSemana(semana)}` : fechaSalida(salida, true)} ·{" "}
            {salida.horaInicio} a {salida.horaFin} h ·{" "}
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

      {salida.semanas.length > 0 && (
        <nav className="no-print mt-6 flex flex-wrap gap-2" aria-label="Filtrar por semana">
          {[{ id: "", texto: "Todas las semanas" }, ...salida.semanas.map((w) => ({ id: w.id, texto: nombreSemana(w) }))].map(
            (op) => {
              const activa = (semana?.id ?? "") === op.id;
              const w = salida.semanas.find((x) => x.id === op.id);
              return (
                <Link
                  key={op.id || "todas"}
                  href={op.id ? `?semana=${op.id}` : `/admin/salidas/${id}/inscritos`}
                  aria-current={activa ? "page" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    activa ? "border-marca bg-marca text-white" : "border-linea bg-white text-tinta hover:border-marca"
                  }`}
                >
                  {op.texto}
                  {w && <span className={activa ? "text-white/75" : "text-gris"}> · {w.cuposTomados}/{w.cupos}</span>}
                </Link>
              );
            },
          )}
        </nav>
      )}

      {semana && (
        <nav className="no-print mt-3 flex flex-wrap gap-2" aria-label="Filtrar por día">
          {[null, ...diasSemana(semana)].map((f) => {
            const activa = dia === f;
            return (
              <Link
                key={f ?? "todos"}
                href={f ? `?semana=${semana.id}&dia=${f}` : `?semana=${semana.id}`}
                aria-current={activa ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-xs font-medium first-letter:uppercase ${
                  activa ? "border-bosque bg-bosque text-white" : "border-linea bg-white text-tinta hover:border-bosque"
                }`}
              >
                {f ? (
                  <>
                    {fechaLarga(f).replace(/ de .*/, "")}
                    <span className={activa ? "text-white/75" : "text-gris"}>
                      {" "}
                      · {tomadosEn(semana, f)}/{semana.cupos}
                    </span>
                  </>
                ) : (
                  "Todos los días"
                )}
              </Link>
            );
          })}
        </nav>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Niños inscritos", `${ninos.length}`],
          dia && semana
            ? ["Cupos del día", `${tomadosEn(semana, dia)} / ${semana.cupos}`]
            : semana
            ? ["Cupos (día más lleno)", `${semana.cuposTomados} / ${semana.cupos}`]
            : salida.semanas.length
              ? ["Semanas", `${salida.semanas.length}`]
              : ["Cupos", `${salida.cuposTomados} / ${salida.cupos}`],
          ["Con datos de salud", `${conSalud.length}`],
          [
            semana ? "Recaudado en la semana" : "Recaudado",
            clp(
              // Con un día elegido, igual se suma lo de toda la semana (el precio se paga por semana).
              todas.filter((i) => i.estado === "pagada" && (!semana || eleccionSemana(i))).reduce((t, i) => {
                if (!semana) return t + i.total;
                const w = i.semanas?.find((x) => x.id === semana.id);
                return t + (w ? w.precio * i.cantidad : 0);
              }, 0),
            ),
          ],
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
                <b>{nombreNino(n)}</b> ({n.edad}):{" "}
                {[hayDato(n.alergias) && `Alergias: ${n.alergias}`, hayDato(n.salud) && n.salud].filter(Boolean).join(" · ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ninos.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-linea bg-white p-10 text-center text-gris">
          Todavía no hay inscripciones pagadas {dia ? "para este día" : semana ? "en esta semana" : "en esta salida"}.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-linea text-xs tracking-wider text-gris uppercase">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Niño o niña</th>
                {salida.semanas.length > 0 && !dia && <th className="p-3">{semana ? "Días" : "Fechas"}</th>}
                <th className="p-3">Salud</th>
                <th className="p-3">Apoderado</th>
                <th className="p-3">Emergencia y retiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linea">
              {ninos.map((n, i) => (
                <tr key={i} className="align-top">
                  <td className="p-3 text-gris">{i + 1}</td>
                  <td className="p-3">
                    <b>{nombreNino(n)}</b>
                    <div className="text-gris">{edadNino(n)}</div>
                    {n.rut && <div className="text-gris">{n.rut}</div>}
                  </td>
                  {salida.semanas.length > 0 && !dia && (
                    <td className="p-3">
                      {semana ? (
                        (() => {
                          const w = eleccionSemana(n.insc);
                          return w && (semanaCompleta(w) ? "Semana completa" : textoSemanaInscrita(w));
                        })()
                      ) : (
                        n.insc.semanas?.map((w) => (
                          <div key={w.id} className="whitespace-nowrap">
                            {textoSemanaInscrita(w)}
                          </div>
                        ))
                      )}
                    </td>
                  )}
                  <td className="p-3">
                    {n.alergias !== undefined && <div>Alergias: {n.alergias || "—"}</div>}
                    <div>{n.salud || "—"}</div>
                    {n.grupoSanguineo && <div className="text-gris">Grupo {n.grupoSanguineo}</div>}
                    {n.insc.centroMedico && <div className="text-gris">Centro médico: {n.insc.centroMedico}</div>}
                  </td>
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
                    {n.insc.retiro && (
                      <div className="mt-2">
                        <span className="text-gris">Retira:</span> {n.insc.retiro.nombre}
                        <div className="text-gris">
                          <a href={`tel:${n.insc.retiro.telefono}`}>{n.insc.retiro.telefono}</a>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {conComentarios.length > 0 && (
        <section className="mt-6 rounded-2xl bg-white p-5">
          <h2 className="font-semibold text-marca">Lo que nos contaron las familias</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {conComentarios.map((i) => (
              <li key={i.id}>
                <b>{i.ninos.map(nombreNino).join(", ")}</b>: {i.comentarios}
              </li>
            ))}
          </ul>
        </section>
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
