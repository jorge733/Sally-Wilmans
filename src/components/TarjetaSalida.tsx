import Link from "next/link";
import { clp, edades, fechaCorta } from "@/lib/format";
import { cuposLibres, libresSemana, porSemanas, salidaAbierta, semanaAbierta, semanasVigentes } from "@/lib/salida-utils";
import type { Salida } from "@/lib/types";
import { IconoFlecha, IconoLugar, IconoNinos, IconoReloj } from "./Iconos";
import { Paisaje } from "./Paisaje";

/** Precio que se muestra: en salidas por semanas, el de la semana más barata. */
export function textoPrecio(salida: Salida): { valor: string; detalle: string } {
  if (!porSemanas(salida)) return { valor: clp(salida.precio), detalle: "por niño" };
  const distintos = new Set(salida.semanas.map((w) => w.precio)).size > 1;
  return { valor: `${distintos ? "Desde " : ""}${clp(salida.precio)}`, detalle: "por niño, cada semana" };
}

function EstadoSemanas({ salida }: { salida: Salida }) {
  const vigentes = semanasVigentes(salida);
  const conCupo = vigentes.filter((w) => semanaAbierta(w)).length;
  const abierta = salidaAbierta(salida);
  const cupos = vigentes.reduce((t, w) => t + w.cupos, 0);
  const pct = cupos ? Math.min(100, (vigentes.reduce((t, w) => t + w.cupos - libresSemana(w), 0) / cupos) * 100) : 100;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs font-medium">
        <span className={abierta ? "text-bosque" : "text-gris"}>
          {!abierta
            ? "Semanas completas"
            : conCupo === 1
              ? "Queda 1 semana con cupos"
              : `${conCupo} semanas con cupos`}
        </span>
        <span className="text-gris">{salida.semanas.length} semanas</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-linea">
        <div className={`barra-cupos h-full rounded-full ${abierta ? "bg-bosque" : "bg-gris"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EstadoCupos({ salida }: { salida: Salida }) {
  if (porSemanas(salida)) return <EstadoSemanas salida={salida} />;
  const libres = cuposLibres(salida);
  const pct = Math.min(100, (salida.cuposTomados / salida.cupos) * 100);
  const abierta = salidaAbierta(salida);
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs font-medium">
        <span className={abierta ? (libres <= 3 ? "text-acento" : "text-bosque") : "text-gris"}>
          {!abierta ? "Salida completa" : libres === 1 ? "¡Queda 1 cupo!" : `Quedan ${libres} cupos`}
        </span>
        <span className="text-gris">{salida.cupos} en total</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-linea">
        <div
          className={`barra-cupos h-full rounded-full ${abierta ? (libres <= 3 ? "bg-acento" : "bg-bosque") : "bg-gris"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function TarjetaSalida({ salida, indice }: { salida: Salida; indice: number }) {
  const f = fechaCorta(salida.fecha);
  if (salida.fechaFin && salida.fechaFin !== salida.fecha) {
    const fin = fechaCorta(salida.fechaFin);
    f.dia = `${f.dia}–${fin.dia}`;
    f.semana = `${f.semana} a ${fin.semana}`;
  }
  const abierta = salidaAbierta(salida);
  return (
    <Link
      href={`/salidas/${salida.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-linea bg-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-marca/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {salida.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={salida.fotoUrl} alt="" className="size-full object-cover" />
        ) : (
          <Paisaje variante={indice} className="size-full transition duration-500 group-hover:scale-105" />
        )}
        {salida.fechaFin && (
          <div className="absolute right-3 bottom-3 rounded-full bg-acento px-3 py-1 text-xs font-semibold text-white">
            Lunes a viernes
          </div>
        )}
        <div className="absolute top-3 left-3 rounded-xl bg-white px-3 py-1.5 text-center leading-tight shadow">
          <div className="text-[10px] font-semibold tracking-wider text-gris uppercase">{f.semana}</div>
          <div className="font-serif text-2xl font-semibold text-marca">{f.dia}</div>
          <div className="text-[11px] font-semibold text-acento uppercase">{f.mes}</div>
        </div>
        {!abierta && (
          <div className="absolute top-3 right-3 rounded-full bg-tinta/85 px-3 py-1 text-xs font-semibold text-white">
            Completa
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-xl font-semibold text-marca">{salida.titulo}</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-gris">
            <li className="flex items-start gap-2">
              <IconoLugar className="mt-0.5 size-4 shrink-0" /> {salida.lugar}
            </li>
            <li className="flex items-center gap-2">
              <IconoReloj className="size-4 shrink-0" /> {salida.horaInicio} a {salida.horaFin} h
            </li>
            <li className="flex items-center gap-2">
              <IconoNinos className="size-4 shrink-0" /> {edades(salida.edadMin, salida.edadMax)}
            </li>
          </ul>
        </div>
        <div className="mt-auto space-y-4">
          <EstadoCupos salida={salida} />
          <div className="flex items-center justify-between border-t border-linea pt-4">
            <div>
              <div className="text-xs text-gris">{textoPrecio(salida).detalle}</div>
              <div className="text-lg font-bold">{textoPrecio(salida).valor}</div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-semibold ${abierta ? "text-acento" : "text-gris"}`}
            >
              {abierta ? "Inscribir" : "Ver detalle"}
              <IconoFlecha className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
