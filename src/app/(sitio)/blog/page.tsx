import type { Metadata } from "next";
import { TarjetaArticulo } from "@/components/TarjetaArticulo";
import { articulosPublicados } from "@/lib/data";
import { OG_BASE, SITIO } from "@/lib/site";

const titulo = "Blog";
const descripcion = `Consejos, relatos de salidas y novedades del ${SITIO.nombre}: naturaleza, juego libre y crianza lejos de las pantallas.`;

export const metadata: Metadata = {
  title: titulo,
  description: descripcion,
  alternates: { canonical: "/blog" },
  // La imagen sale de opengraph-image.tsx de esta carpeta.
  openGraph: { ...OG_BASE, title: `${titulo} · ${SITIO.nombre}`, description: descripcion, url: "/blog" },
  twitter: { card: "summary_large_image", title: `${titulo} · ${SITIO.nombre}`, description: descripcion },
};

/** Se regenera cada minuto; al guardar un artículo en el panel se actualiza al instante. */
export const revalidate = 60;

export default async function PaginaBlog() {
  const articulos = await articulosPublicados();
  return (
    <div className="bg-crema pt-[calc(var(--alto-encabezado)+3rem)] pb-12 sm:pt-[calc(var(--alto-encabezado)+4rem)] sm:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="etiqueta">Blog</p>
        <h1 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">Desde el cerro</h1>
        <p className="mt-3 max-w-2xl text-lg text-gris">{descripcion}</p>

        {articulos.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articulos.map((a) => (
              <div key={a.id} className="flex [&>*]:w-full">
                <TarjetaArticulo articulo={a} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-linea bg-white p-10 text-center">
            <p className="mano text-3xl text-marca">¡Pronto los primeros artículos!</p>
            <p className="mt-2 text-gris">Estamos escribiendo. Vuelve en unos días.</p>
          </div>
        )}
      </div>
    </div>
  );
}
