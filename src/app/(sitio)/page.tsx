import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  IconoCorazon,
  IconoCorreo,
  IconoEscudo,
  IconoFlecha,
  IconoGrupo,
  IconoInstagram,
  IconoSendero,
  IconoWhatsapp,
} from "@/components/Iconos";
import { Paisaje } from "@/components/Paisaje";
import { TarjetaSalida } from "@/components/TarjetaSalida";
import { JsonLd, organizacion, preguntasFrecuentes, sitioWeb } from "@/lib/datos-estructurados";
import { varianteDe } from "@/lib/salida-utils";
import { obtenerAjustes, obtenerContenido, obtenerFotosSitio, salidasPublicas } from "@/lib/data";
import { FOTOS_INCLUIDAS, type FotoSitio } from "@/lib/fotos-sitio";
import { estadoEncuesta } from "@/lib/encuesta";
import { hoyChile, linkWhatsapp } from "@/lib/format";
import { OG_BASE, SITIO } from "@/lib/site";

const ICONOS_CUIDADO = [IconoGrupo, IconoEscudo, IconoCorazon, IconoSendero];

/** Recuadro que ocupa cada foto en la grilla de la galería. */
const FORMATOS_GALERIA = {
  grande: {
    clase: "col-span-2 row-span-2",
    sizes: "(min-width: 768px) 560px, 100vw",
  },
  ancha: { clase: "col-span-2", sizes: "(min-width: 768px) 560px, 100vw" },
  normal: { clase: "", sizes: "(min-width: 768px) 280px, 50vw" },
  vertical: { clase: "row-span-2", sizes: "(min-width: 768px) 280px, 50vw" },
};


function Hoja({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 21c0-7 0-11 0-17M12 9c-3-1-5-3-5.5-5.5C9.5 4 11.5 6 12 9Zm0 4c3-1 5-3 5.5-5.5-3 .5-5 2.5-5.5 5.5Zm0 4c-3-1-5-3-5.5-5.5C9.5 12 11.5 14 12 17Z" />
    </svg>
  );
}

/** Foto de la página: las incluidas van optimizadas por Next; las subidas, tal cual (ya vienen achicadas). */
function Foto({
  foto,
  sizes,
  className,
  priority,
}: {
  foto: FotoSitio;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const incluida = foto.clave ? FOTOS_INCLUIDAS[foto.clave] : undefined;
  if (incluida) {
    return (
      <Image
        src={incluida}
        alt={foto.alt}
        priority={priority}
        placeholder="blur"
        sizes={sizes}
        className={className}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={foto.url}
      alt={foto.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={className}
    />
  );
}

/** Texto con **negritas**, como lo escribe Sally en el panel. */
function ConNegritas({ texto }: { texto: string }) {
  return texto.split(/\*\*(.+?)\*\*/g).map((t, i) =>
    i % 2 ? (
      <b key={i} className="text-tinta">
        {t}
      </b>
    ) : (
      t
    ),
  );
}

/** Retraso de una animación de entrada, para escalonar elementos. */
const retraso = (ms: number) =>
  ({ "--retraso": `${ms}ms` }) as React.CSSProperties;

/** Se regenera cada minuto para mostrar fechas y cupos al día. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  // Al definir openGraph acá se pierde la imagen heredada de app/opengraph-image.tsx, así que se repite.
  openGraph: {
    ...OG_BASE,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: `${SITIO.nombre}: ${SITIO.bajada}`,
      },
    ],
  },
};

export const revalidate = 60;

export default async function Inicio() {
  const [salidas, ajustes, c, fotos] = await Promise.all([
    salidasPublicas(),
    obtenerAjustes(),
    obtenerContenido(),
    obtenerFotosSitio(),
  ]);
  // El aviso de la encuesta solo aparece mientras recibe respuestas (y si Sally no lo ocultó).
  const encuestaVisible = c.encuesta.mostrar && estadoEncuesta(hoyChile()) === "abierta";

  return (
    <>
      <JsonLd datos={[organizacion(ajustes), sitioWeb(), preguntasFrecuentes(c.preguntas.lista)]} />
      {/* Banner: encuesta del grupo de jóvenes */}
      {encuestaVisible && (
      <Link
        href="/encuesta"
        className="group block bg-acento px-4 py-3 text-center text-sm text-white transition-colors hover:bg-acento-oscuro sm:text-base"
      >
        <span className="font-semibold">{c.encuesta.bannerDestacado}</span>{" "}
        {c.encuesta.bannerTexto}{" "}
        <span className="font-semibold whitespace-nowrap underline underline-offset-4">
          {c.encuesta.bannerBoton}
          <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </Link>
      )}

      {/* Portada */}
      <section className="relative isolate overflow-hidden bg-marca text-white">
        <Paisaje
          variante={0}
          conNieve
          animado
          className="absolute inset-0 -z-10 size-full opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-marca/80 to-marca" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <div>
            <p className="entrada mano text-2xl text-[#f6c68f] sm:text-3xl">
              {c.portada.antetitulo}
            </p>
            <h1
              style={retraso(100)}
              className="entrada mt-3 text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-[3.4rem]"
            >
              {c.portada.titulo}
            </h1>
            <p
              style={retraso(220)}
              className="entrada mt-6 max-w-xl text-lg text-marca-claro"
            >
              {c.portada.texto}
            </p>
            <div
              style={retraso(340)}
              className="entrada mt-8 flex flex-wrap gap-3"
            >
              <Link href="#salidas" className="btn btn-primario">
                Ver próximas fechas <IconoFlecha />
              </Link>
              <Link href="#nosotros" className="btn btn-secundario text-white">
                Conoce el club
              </Link>
            </div>
            <p
              style={retraso(460)}
              className="entrada mt-8 text-sm text-marca-claro"
            >
              {c.portada.lineaFinal}
            </p>
          </div>
          <figure className="entrada-foto relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-black/30 ring-4 ring-white/10">
              <Foto
                foto={fotos.portada}
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="h-auto w-full"
              />
            </div>
            <figcaption className="estampa mano absolute -bottom-5 left-5 -rotate-2 rounded-xl bg-crema px-4 py-1.5 text-2xl text-marca shadow-lg">
              {c.portada.pieFoto}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Pilares */}
      <section className="border-b border-linea bg-crema">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-3 px-4 py-6 sm:px-6 md:grid-cols-4">
          {c.pilares.map((p, i) => (
            <li
              key={i}
              data-revelar="zoom"
              style={retraso(i * 90)}
              className="mano flex items-center justify-center gap-2 text-2xl text-marca uppercase sm:text-3xl"
            >
              <Hoja className="size-5 text-bosque" /> {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Próximas fechas */}
      <section id="salidas" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            data-revelar
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="etiqueta">Calendario</p>
              <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">
                {c.fechas.titulo}
              </h2>
            </div>
            <p className="max-w-md text-gris">
              {c.fechas.texto}
            </p>
          </div>
          {salidas.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {salidas.map((s, i) => (
                <div
                  key={s.id}
                  data-revelar
                  style={retraso((i % 3) * 120)}
                  className="flex [&>*]:w-full"
                >
                  <TarjetaSalida salida={s} indice={varianteDe(s.id)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-linea bg-white p-10 text-center">
              <p className="mano text-3xl text-marca">{c.fechas.vacioTitulo}</p>
              <p className="mt-2 text-gris">
                {c.fechas.vacioTexto}
              </p>
            </div>
          )}

          {/* Invitación a la encuesta del grupo de jóvenes */}
          {encuestaVisible && (
          <div
            data-revelar
            className="mt-12 flex flex-col gap-5 rounded-3xl bg-crema p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div>
              <p className="etiqueta">{c.encuesta.bannerDestacado}</p>
              <h3 className="mt-2 text-2xl font-semibold text-marca">
                {c.encuesta.titulo}
              </h3>
              <p className="mt-2 max-w-xl text-gris">{c.encuesta.texto}</p>
            </div>
            <Link href="/encuesta" className="btn btn-primario shrink-0">
              Responder la encuesta
            </Link>
          </div>
          )}
        </div>
      </section>

      {/* Quiénes somos */}
      <section id="nosotros" className="scroll-mt-20 bg-crema py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
          <div data-revelar="izquierda" className="relative">
            <div className="overflow-hidden rounded-3xl shadow-xl shadow-marca/10">
              <Foto
                foto={fotos.nosotros}
                sizes="(min-width: 768px) 560px, 100vw"
                className="h-auto w-full"
              />
            </div>
            <div className="absolute -right-3 -bottom-5 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-marca/10 sm:-right-6">
              <div className="mano text-4xl text-acento">
                {c.nosotros.sello}
              </div>
              <div className="text-sm text-gris">{c.nosotros.selloTexto}</div>
            </div>
          </div>
          <div data-revelar="derecha" style={retraso(150)}>
            <p className="etiqueta">Quiénes somos</p>
            <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">
              {c.nosotros.titulo}
            </h2>
            <div className="mt-5 space-y-4 text-gris">
              {c.nosotros.parrafos
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    <ConNegritas texto={p} />
                  </p>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Club de Verano */}
      {c.verano.mostrar && (
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            data-revelar="zoom"
            className="relative isolate overflow-hidden rounded-3xl bg-acento px-6 py-12 text-white sm:px-12"
          >
            <Paisaje
              variante={2}
              className="absolute inset-y-0 right-0 -z-10 hidden h-full w-1/2 opacity-60 md:block"
            />
            <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-acento via-acento/90 to-transparent md:block" />
            <p className="mano text-3xl text-[#fde3c3]">Club de Verano</p>
            <h2 className="mt-1 max-w-lg text-3xl font-semibold sm:text-4xl">
              {c.verano.titulo}
            </h2>
            <p className="mt-4 max-w-lg whitespace-pre-line text-white/90">
              {c.verano.texto}
            </p>
            <Link
              href="#salidas"
              className="btn mt-7 bg-white text-acento hover:bg-crema"
            >
              {c.verano.boton} <IconoFlecha />
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-20 bg-crema py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="etiqueta">Inscripción</p>
          <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">
            {c.pasos.titulo}
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.pasos.lista.map((p, i) => (
              <li
                key={i}
                data-revelar
                style={retraso(i * 120)}
                className="rounded-2xl bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-marca/10"
              >
                <div className="mano flex size-11 items-center justify-center rounded-full bg-marca text-2xl text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-gris">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cuidados */}
      <section className="bg-marca py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="etiqueta !text-[#f6c68f]">Seguridad</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold sm:text-4xl">
            {c.cuidados.titulo}
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {c.cuidados.lista.map((cuidado, i) => {
              const Icono = ICONOS_CUIDADO[i % ICONOS_CUIDADO.length];
              return (
                <div key={i} data-revelar style={retraso(i * 120)}>
                  <Icono className="size-8 text-[#f6c68f]" />
                  <h3 className="mt-4 text-lg font-semibold">{cuidado.titulo}</h3>
                  <p className="mt-2 text-sm text-marca-claro">{cuidado.texto}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Galería */}
      {fotos.galeria.length > 0 && (
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="etiqueta">Galería</p>
              <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">
                {c.galeria.titulo}
              </h2>
            </div>
            {ajustes.instagram && (
              <a
                href={`https://instagram.com/${ajustes.instagram}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 font-semibold text-bosque hover:underline"
              >
                <IconoInstagram /> Más fotos en @{ajustes.instagram}
              </a>
            )}
          </div>
          <div className="mt-10 grid auto-rows-[160px] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
            {fotos.galeria.map((foto, i) => (
              <div
                key={foto.id}
                data-revelar="zoom"
                style={retraso(i * 80)}
                className={`group overflow-hidden rounded-2xl ${FORMATOS_GALERIA[foto.formato].clase}`}
              >
                <Foto
                  foto={foto}
                  sizes={FORMATOS_GALERIA[foto.formato].sizes}
                  className="size-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Preguntas */}
      <section className="bg-crema py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="etiqueta text-center">Preguntas frecuentes</p>
          <h2 className="mt-2 text-center text-3xl font-semibold text-marca sm:text-4xl">
            {c.preguntas.titulo}
          </h2>
          <div
            data-revelar
            className="mt-10 divide-y divide-linea rounded-2xl bg-white"
          >
            {c.preguntas.lista.map((q, i) => (
              <details key={i} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.p}
                  <span className="text-xl text-acento transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-gris">{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            data-revelar="zoom"
            className="grid items-center gap-8 rounded-3xl bg-marca p-8 text-white sm:p-12 md:grid-cols-[1.3fr_1fr]"
          >
            <div>
              <p className="mano text-3xl text-[#f6c68f]">{c.contacto.antetitulo}</p>
              <h2 className="mt-1 text-3xl font-semibold sm:text-4xl">
                {c.contacto.titulo}
              </h2>
              <p className="mt-3 max-w-md text-marca-claro">
                {c.contacto.texto}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {ajustes.whatsapp && (
                <a
                  href={linkWhatsapp(ajustes.whatsapp)}
                  className="btn bg-[#25d366] text-white hover:bg-[#1eb858]"
                  target="_blank"
                  rel="noopener"
                >
                  <IconoWhatsapp className="size-5" /> Escribir por WhatsApp
                </a>
              )}
              {ajustes.instagram && (
                <a
                  href={`https://instagram.com/${ajustes.instagram}`}
                  className="btn btn-secundario text-white"
                  target="_blank"
                  rel="noopener"
                >
                  <IconoInstagram /> @{ajustes.instagram}
                </a>
              )}
              {ajustes.email && (
                <a
                  href={`mailto:${ajustes.email}`}
                  className="btn btn-secundario text-white"
                >
                  <IconoCorreo /> {ajustes.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
