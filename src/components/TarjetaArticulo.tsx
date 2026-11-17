import Link from "next/link";
import { fechaArticulo, minutosLectura, type Articulo } from "@/lib/blog";

/** Tarjeta de un artículo en el listado del blog y en el inicio. */
export function TarjetaArticulo({ articulo: a }: { articulo: Articulo }) {
  return (
    <Link
      href={`/blog/${a.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-linea/60 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-marca/10"
    >
      <div className="aspect-[16/10] overflow-hidden bg-marca-claro">
        {a.portada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.portada.url}
            alt={a.portada.alt}
            loading="lazy"
            className="size-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-marca-claro to-crema">
            <span className="mano text-4xl text-marca/70">Club de la Montaña</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-xs font-medium text-gris">
          {fechaArticulo(a.fecha)} · {minutosLectura(a.cuerpo)} min de lectura
        </div>
        <h3 className="mt-2 text-xl leading-snug font-semibold text-marca group-hover:underline">{a.titulo}</h3>
        {a.resumen && <p className="mt-2 line-clamp-3 text-gris">{a.resumen}</p>}
        <span className="mt-auto pt-4 text-sm font-semibold text-acento">Leer artículo →</span>
      </div>
    </Link>
  );
}
