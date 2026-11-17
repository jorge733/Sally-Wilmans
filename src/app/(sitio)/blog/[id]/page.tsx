import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TarjetaArticulo } from "@/components/TarjetaArticulo";
import { TextoArticulo } from "@/components/TextoArticulo";
import { fechaArticulo, minutosLectura, textoPlano } from "@/lib/blog";
import { articuloBlog, JsonLd } from "@/lib/datos-estructurados";
import { articulosPublicados, obtenerArticulo } from "@/lib/data";
import { OG_BASE, SITIO } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

/** Se genera al primer visitante y se regenera cada minuto (o al guardar en el panel). */
export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

async function publicado(id: string) {
  const a = await obtenerArticulo(id);
  return a?.estado === "publicado" ? a : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await publicado(id);
  if (!a) return {};
  const texto = a.resumen || textoPlano(a.cuerpo);
  const description = texto.length > 200 ? `${texto.slice(0, 197).replace(/\s+\S*$/, "")}…` : texto;
  const url = `/blog/${id}`;
  // La imagen la arma opengraph-image.tsx (portada del artículo + título, fecha y autora).
  return {
    title: a.titulo,
    description,
    alternates: { canonical: url },
    authors: [{ name: SITIO.responsable }],
    openGraph: {
      ...OG_BASE,
      type: "article",
      title: a.titulo,
      description,
      url,
      publishedTime: a.fecha,
      modifiedTime: new Date(a.actualizadoEn || a.creadoEn).toISOString(),
      authors: [SITIO.responsable],
      section: "Blog",
    },
    twitter: { card: "summary_large_image", title: a.titulo, description },
  };
}

export default async function PaginaArticulo({ params }: Props) {
  const { id } = await params;
  const a = await publicado(id);
  if (!a) notFound();
  const otros = (await articulosPublicados()).filter((x) => x.id !== a.id).slice(0, 3);

  return (
    <>
      <JsonLd datos={articuloBlog(a)} />
      <article className="pb-16">
        <header className="bg-crema pt-10 pb-12 sm:pt-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Link href="/blog" className="text-sm font-medium text-gris hover:text-tinta">
              ← Blog
            </Link>
            <h1 className="mt-4 text-3xl leading-tight font-semibold break-words text-marca sm:text-5xl">{a.titulo}</h1>
            {a.resumen && <p className="mt-4 text-lg text-gris sm:text-xl">{a.resumen}</p>}
            <p className="mt-5 text-sm text-gris">
              <span className="font-semibold text-tinta">{SITIO.responsable}</span>
              <span className="mx-2 opacity-50">·</span>
              <time dateTime={a.fecha}>{fechaArticulo(a.fecha)}</time>
              <span className="mx-2 opacity-50">·</span>
              {minutosLectura(a.cuerpo)} min de lectura
            </p>
          </div>
        </header>

        {a.portada && (
          <figure className="mx-auto max-w-4xl px-4 sm:px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.portada.url}
              alt={a.portada.alt}
              fetchPriority="high"
              className="mt-8 max-h-[32rem] w-full rounded-3xl bg-crema object-cover shadow-xl shadow-marca/10"
            />
            {a.portada.alt && <figcaption className="mt-2 text-center text-sm text-gris">{a.portada.alt}</figcaption>}
          </figure>
        )}

        <div className="mx-auto mt-10 max-w-3xl px-4 break-words sm:px-6">
          <TextoArticulo cuerpo={a.cuerpo} />

          <div className="mt-14 flex flex-col gap-4 rounded-3xl bg-marca p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="mano text-3xl">¿Vamos al cerro?</p>
              <p className="mt-1 text-marca-claro">Revisa las próximas salidas e inscribe a tus hijos en línea.</p>
            </div>
            <Link href="/#salidas" className="btn btn-primario shrink-0">
              Ver próximas fechas
            </Link>
          </div>
        </div>
      </article>

      {otros.length > 0 && (
        <section className="bg-crema py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold text-marca">Sigue leyendo</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otros.map((x) => (
                <div key={x.id} className="flex [&>*]:w-full">
                  <TarjetaArticulo articulo={x} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
