import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconoCheck, IconoMochila } from "@/components/Iconos";
import { obtenerInscripcion, obtenerSalida } from "@/lib/data";
import { ESTADO_FLOW } from "@/lib/flow";
import { clp, fechaHora, fechaSalida, horaChile } from "@/lib/format";
import { BotonImprimir, BotonReintentar, Refrescar } from "./Clientes";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Tu inscripción", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PaginaEstadoInscripcion({ params }: Props) {
  const insc = await obtenerInscripcion((await params).id);
  if (!insc) notFound();
  const salida = await obtenerSalida(insc.salidaId);

  const vencida = insc.estado === "expirada" || (insc.estado === "pendiente" && insc.expiraEn < Date.now());
  const rechazado = insc.flow?.status === ESTADO_FLOW.rechazado || insc.flow?.status === ESTADO_FLOW.anulado;

  const resumen = (
    <div className="rounded-2xl bg-marca p-5 text-white">
      <div className="text-xs font-semibold tracking-wider text-marca-claro uppercase">Salida</div>
      <div className="mt-1 font-serif text-xl font-semibold">{insc.salidaTitulo}</div>
      {salida && (
        <div className="mt-1 text-sm text-marca-claro first-letter:uppercase">
          {fechaSalida(salida)} · {salida.horaInicio} a {salida.horaFin} h
        </div>
      )}
    </div>
  );

  let contenido: React.ReactNode;

  if (insc.estado === "pagada") {
    contenido = (
      <>
        <div className="rounded-2xl bg-white p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-bosque text-white">
            <IconoCheck className="size-8" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-marca">¡Inscripción confirmada!</h1>
          <p className="mt-2 text-gris">
            Enviamos el comprobante a <b className="text-tinta">{insc.apoderado.email}</b>. Sally también recibió el
            aviso.
          </p>
        </div>
        {resumen}
        <div className="rounded-2xl bg-white p-6">
          <h2 className="text-xl font-semibold text-marca">Comprobante</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gris">Inscritos</dt>
              <dd className="font-semibold">
                {insc.ninos.map((n, i) => (
                  <div key={i}>
                    {n.nombre} ({n.edad} años)
                  </div>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-gris">Total pagado</dt>
              <dd className="font-semibold">{clp(insc.total)}</dd>
            </div>
            {insc.pagadoEn && (
              <div>
                <dt className="text-gris">Fecha de pago</dt>
                <dd className="font-semibold">{fechaHora(insc.pagadoEn)}</dd>
              </div>
            )}
            {insc.flow?.flowOrder ? (
              <div>
                <dt className="text-gris">N° de orden Flow</dt>
                <dd className="font-semibold">{insc.flow.flowOrder}</dd>
              </div>
            ) : null}
            {salida?.puntoEncuentro && (
              <div className="sm:col-span-2">
                <dt className="text-gris">Punto de encuentro</dt>
                <dd className="font-semibold">{salida.puntoEncuentro}</dd>
              </div>
            )}
          </dl>
          {salida && salida.queLlevar.length > 0 && (
            <>
              <h3 className="mt-6 flex items-center gap-2 font-semibold">
                <IconoMochila className="size-5 text-acento" /> Qué deben llevar
              </h3>
              <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                {salida.queLlevar.map((x) => (
                  <li key={x} className="flex gap-2">
                    <IconoCheck className="size-4 shrink-0 text-bosque" /> {x}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="no-print flex flex-wrap justify-center gap-3">
          <BotonImprimir />
          <Link href="/#salidas" className="btn btn-primario">
            Ver más salidas
          </Link>
        </div>
      </>
    );
  } else if (insc.estado === "anulada") {
    contenido = (
      <Aviso titulo="Esta inscripción fue anulada">
        El pago se anuló o fue reembolsado, así que el cupo quedó libre. Si crees que es un error, escríbenos.
      </Aviso>
    );
  } else if (vencida) {
    contenido = (
      <Aviso titulo="La reserva venció">
        No recibimos el pago dentro de los 30 minutos, así que el cupo se liberó. Si ya pagaste, escríbenos y lo
        revisamos.
        <div className="mt-6">
          <Link href={`/salidas/${insc.salidaId}/inscripcion`} className="btn btn-primario">
            Inscribir de nuevo
          </Link>
        </div>
      </Aviso>
    );
  } else if (rechazado) {
    contenido = (
      <Aviso titulo="El pago no se completó">
        Flow no aprobó el pago. Tu cupo sigue guardado hasta las {horaChile(insc.expiraEn)} h:
        puedes intentarlo otra vez con el mismo u otro medio de pago.
        <div className="mt-6">
          <BotonReintentar inscripcionId={insc.id} />
        </div>
      </Aviso>
    );
  } else {
    contenido = (
      <Aviso titulo="Estamos confirmando tu pago">
        <Refrescar />
        Esto suele tardar unos segundos; la página se actualiza sola. Tu cupo queda guardado hasta las{" "}
        {horaChile(insc.expiraEn)} h.
        {insc.flow?.url && (
          <div className="mt-6">
            <a href={insc.flow.url} className="btn btn-secundario text-marca">
              Volver a Flow para pagar
            </a>
          </div>
        )}
      </Aviso>
    );
  }

  return (
    <div className="bg-crema py-10 sm:py-14">
      <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6">
        {contenido}
        {insc.estado !== "pagada" && resumen}
      </div>
    </div>
  );
}

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center">
      <h1 className="text-2xl font-semibold text-marca">{titulo}</h1>
      <div className="mt-3 text-gris">{children}</div>
    </div>
  );
}
