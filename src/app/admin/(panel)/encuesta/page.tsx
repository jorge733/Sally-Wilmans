import Link from "next/link";
import { respuestasEncuesta } from "@/lib/data";
import {
  CON_AMIGOS,
  EDADES_ENCUESTA,
  ENCUESTA_ABRE,
  ENCUESTA_CIERRA,
  estadoEncuesta,
  fechaEncuesta,
  PREGUNTAS_ENCUESTA,
  VINO_ANTES,
} from "@/lib/encuesta";
import { fechaHora, hoyChile } from "@/lib/format";
import { BotonBorrar } from "./BotonBorrar";

export const metadata = { title: "Encuesta jóvenes" };

/** Opciones ordenadas de más a menos votadas, con su barra. */
function Conteo({
  titulo,
  opciones,
  votos,
  total,
  children,
}: {
  titulo: string;
  opciones: string[];
  votos: (o: string) => number;
  total: number;
  children?: React.ReactNode;
}) {
  const filas = opciones.map((o) => ({ o, n: votos(o) })).sort((a, b) => b.n - a.n);
  return (
    <section className="rounded-2xl bg-white p-5">
      <h3 className="font-semibold text-marca">{titulo}</h3>
      <ul className="mt-3 space-y-2">
        {filas.map(({ o, n }) => (
          <li key={o} className="text-sm">
            <div className="flex justify-between gap-3">
              <span className={n ? "" : "text-gris"}>{o}</span>
              <span className="shrink-0 font-semibold tabular-nums">
                {n}
                {total > 0 && <span className="ml-1 font-normal text-gris">({Math.round((n / total) * 100)}%)</span>}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-crema">
              <div className="h-full rounded-full bg-bosque" style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}

export default async function PanelEncuesta() {
  const respuestas = await respuestasEncuesta();
  const total = respuestas.length;
  const enlace = `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/encuesta`;
  const estado = estadoEncuesta(hoyChile());
  const nombres = respuestas.map((r) => r.nombreGrupo).filter(Boolean);
  const noGusta = respuestas.map((r) => r.noMeGustaria).filter(Boolean);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-marca">Encuesta jóvenes</h1>
          <p className="mt-1 text-gris">
            Intereses del grupo de 13 a 16 años. Comparte este enlace:{" "}
            <Link href="/encuesta" target="_blank" className="font-semibold text-bosque hover:underline">
              {enlace || "/encuesta"}
            </Link>
          </p>
          <p className="mt-1 text-sm text-gris">
            {estado === "pronto" ? "Abre" : estado === "abierta" ? "Abierta" : "Estuvo abierta"} del{" "}
            {fechaEncuesta(ENCUESTA_ABRE)} al {fechaEncuesta(ENCUESTA_CIERRA)}.
            {estado === "pronto" && " Antes de esa fecha la página muestra un aviso y el inicio no la anuncia."}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-5 py-3 text-center">
          <div className="text-3xl font-semibold text-marca tabular-nums">{total}</div>
          <div className="text-xs text-gris">{total === 1 ? "respuesta" : "respuestas"}</div>
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-linea bg-white p-8 text-center text-gris">
          Todavía nadie responde. Cuando alguien lo haga, te llegará un correo y aparecerá aquí.
        </p>
      ) : (
        <>
          <h2 className="mt-10 mb-3 text-sm font-semibold tracking-wider text-gris uppercase">Resumen</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Conteo
              titulo="Edad"
              opciones={EDADES_ENCUESTA.map((e) => `${e} años`)}
              votos={(o) => respuestas.filter((r) => `${r.edad} años` === o).length}
              total={total}
            />
            {PREGUNTAS_ENCUESTA.map((p) => {
              const otros = respuestas.map((r) => r.otros[p.id]).filter(Boolean) as string[];
              return (
                <Conteo
                  key={p.id}
                  titulo={p.titulo}
                  opciones={p.opciones}
                  votos={(o) => respuestas.filter((r) => r.elegidas[p.id]?.includes(o)).length}
                  total={total}
                >
                  {otros.length > 0 && (
                    <div className="mt-4 border-t border-linea pt-3 text-sm">
                      <div className="font-semibold">Otras ideas</div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-gris">
                        {otros.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Conteo>
              );
            })}
            <Conteo
              titulo="¿Ha venido antes?"
              opciones={VINO_ANTES}
              votos={(o) => respuestas.filter((r) => r.vinoAntes === o).length}
              total={total}
            />
            <Conteo
              titulo="¿Vendría con amigos?"
              opciones={CON_AMIGOS}
              votos={(o) => respuestas.filter((r) => r.conAmigos === o).length}
              total={total}
            />
            {nombres.length > 0 && (
              <section className="rounded-2xl bg-white p-5">
                <h3 className="font-semibold text-marca">Nombres propuestos para el grupo</h3>
                <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm">
                  {nombres.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </section>
            )}
            {noGusta.length > 0 && (
              <section className="rounded-2xl bg-white p-5">
                <h3 className="font-semibold text-marca">Lo que no les gustaría</h3>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                  {noGusta.map((n, i) => (
                    <li key={i} className="whitespace-pre-line">{n}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <h2 className="mt-10 mb-3 text-sm font-semibold tracking-wider text-gris uppercase">Cada respuesta</h2>
          <ul className="space-y-3">
            {respuestas.map((r) => (
              <li key={r.id} className="rounded-2xl bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-semibold text-marca">{r.nombre || "Sin nombre"}</span>
                    <span className="text-gris"> · {r.edad} años</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gris">
                    {fechaHora(r.creadoEn)}
                    <BotonBorrar id={r.id} />
                  </div>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[200px_1fr]">
                  {PREGUNTAS_ENCUESTA.map((p) => {
                    const xs = [...(r.elegidas[p.id] ?? []), ...(r.otros[p.id] ? [`Otro: ${r.otros[p.id]}`] : [])];
                    return (
                      <div key={p.id} className="contents">
                        <dt className="text-gris">{p.titulo}</dt>
                        <dd>{xs.length ? xs.join(" · ") : "—"}</dd>
                      </div>
                    );
                  })}
                  {(
                    [
                      ["¿Ha venido antes?", r.vinoAntes],
                      ["¿Con amigos?", r.conAmigos],
                      ["No le gustaría", r.noMeGustaria],
                      ["Nombre para el grupo", r.nombreGrupo],
                      ["Comentario", r.comentario],
                      ["Contacto del apoderado", r.contactoApoderado],
                    ] as const
                  )
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-gris">{k}</dt>
                        <dd className="whitespace-pre-line">{v}</dd>
                      </div>
                    ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
