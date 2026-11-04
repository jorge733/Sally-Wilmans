import Link from "next/link";
import { todasLasSalidas } from "@/lib/data";
import { clp, fechaSalida, hoyChile } from "@/lib/format";
import { cuposLibres } from "@/lib/salida-utils";
import type { Salida } from "@/lib/types";

export const metadata = { title: "Salidas" };

const ETIQUETA: Record<Salida["estado"], { texto: string; clase: string }> = {
  publicada: { texto: "Publicada", clase: "bg-bosque/15 text-bosque" },
  borrador: { texto: "Borrador", clase: "bg-linea text-gris" },
  cerrada: { texto: "Cerrada", clase: "bg-acento/15 text-acento" },
};

function Fila({ s }: { s: Salida }) {
  const e = ETIQUETA[s.estado];
  const libres = cuposLibres(s);
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white p-5">
      <div className="min-w-0 flex-1 basis-64">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.clase}`}>{e.texto}</span>
          {s.estado === "publicada" && libres === 0 && (
            <span className="rounded-full bg-tinta px-2.5 py-0.5 text-xs font-semibold text-white">Completa</span>
          )}
        </div>
        <Link href={`/admin/salidas/${s.id}`} className="mt-1.5 block font-semibold text-marca hover:underline">
          {s.titulo}
        </Link>
        <div className="text-sm text-gris first-letter:uppercase">
          {fechaSalida(s)} · {s.horaInicio} a {s.horaFin} h · {s.lugar}
        </div>
      </div>
      <div className="text-sm">
        <div className="font-semibold">
          {s.cuposTomados} / {s.cupos} cupos
        </div>
        <div className="text-gris">{clp(s.precio)} por niño</div>
      </div>
      <div className="flex gap-2">
        <Link href={`/admin/salidas/${s.id}/inscritos`} className="btn btn-secundario px-4 py-2 text-sm text-marca">
          Inscritos
        </Link>
        <Link href={`/admin/salidas/${s.id}`} className="btn bg-marca px-4 py-2 text-sm text-white hover:bg-marca/90">
          Editar
        </Link>
      </div>
    </li>
  );
}

export default async function PanelSalidas({ searchParams }: { searchParams: Promise<{ borrada?: string }> }) {
  const { borrada } = await searchParams;
  const todas = await todasLasSalidas();
  const hoy = hoyChile();
  const proximas = todas.filter((s) => (s.fechaFin ?? s.fecha) >= hoy).reverse();
  const pasadas = todas.filter((s) => (s.fechaFin ?? s.fecha) < hoy);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-marca">Salidas</h1>
          <p className="mt-1 text-gris">Crea fechas, cambia precios y cupos, y revisa quiénes están inscritos.</p>
        </div>
        <Link href="/admin/salidas/nueva" className="btn btn-primario">
          + Nueva salida
        </Link>
      </div>

      {borrada && <p className="mt-6 rounded-xl bg-white px-4 py-3 text-sm font-medium">La salida se borró.</p>}

      <h2 className="mt-10 mb-3 text-sm font-semibold tracking-wider text-gris uppercase">Próximas</h2>
      {proximas.length ? (
        <ul className="space-y-3">
          {proximas.map((s) => (
            <Fila key={s.id} s={s} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-linea bg-white p-8 text-center text-gris">
          No hay salidas próximas. Crea la primera con «Nueva salida».
        </p>
      )}

      {pasadas.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 text-sm font-semibold tracking-wider text-gris uppercase">Pasadas</h2>
          <ul className="space-y-3 opacity-80">
            {pasadas.map((s) => (
              <Fila key={s.id} s={s} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
