import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconoCalendario,
  IconoCheck,
  IconoFlecha,
  IconoLugar,
  IconoMochila,
  IconoNinos,
  IconoReloj,
} from "@/components/Iconos";
import { GaleriaSalida } from "@/components/GaleriaSalida";
import { Paisaje } from "@/components/Paisaje";
import { EstadoCupos } from "@/components/TarjetaSalida";
import { obtenerAjustes, obtenerSalida } from "@/lib/data";
import { clp, edades, fechaSalida, linkWhatsapp } from "@/lib/format";
import { salidaAbierta, varianteDe } from "@/lib/salida-utils";
import { OG_BASE } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

/** Se genera al primer visitante y se regenera cada minuto para mostrar los cupos al día. */
export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = await obtenerSalida(id);
  if (!s || s.estado === "borrador") return {};
  const fecha = fechaSalida(s);
  const resumen = `${fecha.charAt(0).toUpperCase() + fecha.slice(1)} · ${s.lugar} · ${edades(s.edadMin, s.edadMax)}.`;
  const texto = `${resumen} ${s.descripcion}`.replace(/\s+/g, " ").trim();
  const description = texto.length > 200 ? `${texto.slice(0, 197).replace(/\s+\S*$/, "")}…` : texto;
  const url = `/salidas/${id}`;
  // La imagen la arma opengraph-image.tsx (foto de la salida + fecha, lugar y cupos).
  return {
    title: s.titulo,
    description,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, title: s.titulo, description, url },
    twitter: { card: "summary_large_image", title: s.titulo, description },
  };
}

export default async function DetalleSalida({ params }: Props) {
  const { id } = await params;
  const [salida, ajustes] = await Promise.all([obtenerSalida(id), obtenerAjustes()]);
  if (!salida || salida.estado === "borrador") notFound();
  const indice = varianteDe(salida.id);
  const abierta = salidaAbierta(salida);

  const datos = [
    { Icono: IconoCalendario, k: "Fecha", v: fechaSalida(salida, true) },
    { Icono: IconoReloj, k: "Horario", v: `${salida.horaInicio} a ${salida.horaFin} h` },
    { Icono: IconoNinos, k: "Edades", v: edades(salida.edadMin, salida.edadMax) },
    { Icono: IconoLugar, k: "Lugar", v: salida.lugar },
  ];

  return (
    <article>
      <div className="relative h-64 overflow-hidden sm:h-80">
        {salida.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={salida.fotoUrl} alt="" className="size-full object-cover" />
        ) : (
          <Paisaje variante={indice} conNieve animado className="size-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-marca/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <Link href="/#salidas" className="text-sm font-medium text-white/80 hover:text-white">
            ← Todas las salidas
          </Link>
          <h1 className="entrada mt-2 text-3xl font-semibold text-white sm:text-5xl">{salida.titulo}</h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <dl className="grid gap-4 sm:grid-cols-2">
            {datos.map(({ Icono, k, v }) => (
              <div key={k} className="flex gap-3 rounded-2xl border border-linea bg-white p-4">
                <Icono className="size-6 shrink-0 text-acento" />
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-gris uppercase">{k}</dt>
                  <dd className="mt-0.5 font-medium first-letter:uppercase">{v}</dd>
                </div>
              </div>
            ))}
          </dl>

          <section>
            <h2 className="text-2xl font-semibold text-marca">Sobre la salida</h2>
            <p className="mt-3 leading-relaxed text-gris">{salida.descripcion}</p>
            {salida.puntoEncuentro && (
              <p className="mt-4 rounded-xl bg-crema px-4 py-3 text-sm">
                <b>Punto de encuentro:</b> {salida.puntoEncuentro}
              </p>
            )}
          </section>

          {salida.fotos.length > 1 && (
            <section>
              <h2 className="text-2xl font-semibold text-marca">Fotos</h2>
              <GaleriaSalida fotos={salida.fotos} titulo={salida.titulo} />
            </section>
          )}

          <section>
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-marca">
              <IconoMochila className="size-6 text-acento" /> Qué llevar
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {salida.queLlevar.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <IconoCheck className="mt-0.5 size-5 shrink-0 text-bosque" /> {x}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-linea bg-white p-6 shadow-xl shadow-marca/5">
            <div className="text-sm text-gris">Valor por niño</div>
            <div className="text-3xl font-bold">{clp(salida.precio)}</div>
            <div className="mt-5">
              <EstadoCupos salida={salida} />
            </div>
            {abierta ? (
              <Link href={`/salidas/${salida.id}/inscripcion`} className="btn btn-primario mt-6 w-full">
                Inscribir <IconoFlecha />
              </Link>
            ) : (
              <div className="mt-6 rounded-xl bg-crema p-4 text-center text-sm">
                Esta salida está completa. Escríbenos si quieres quedar en lista de espera.
              </div>
            )}
            <p className="mt-4 text-center text-xs text-gris">Pago seguro con Flow · débito, crédito y otros medios</p>
            <a
              href={linkWhatsapp(ajustes.whatsapp, `Hola, tengo una duda sobre la salida "${salida.titulo}"`)}
              target="_blank"
              rel="noopener"
              className="mt-4 block text-center text-sm font-semibold text-bosque hover:underline"
            >
              Preguntar por WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
