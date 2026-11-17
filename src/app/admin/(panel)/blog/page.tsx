import Link from "next/link";
import { todosLosArticulos } from "@/lib/data";
import { fechaLarga } from "@/lib/format";

export const metadata = { title: "Blog" };

type Props = { searchParams: Promise<{ borrado?: string }> };

export default async function PanelBlog({ searchParams }: Props) {
  const [articulos, { borrado }] = await Promise.all([todosLosArticulos(), searchParams]);
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-marca">Blog</h1>
          <p className="mt-1 text-gris">Artículos para las familias. Los publicados se ven en la sección Blog del sitio.</p>
        </div>
        <Link href="/admin/blog/nuevo" className="btn btn-primario">
          + Nuevo artículo
        </Link>
      </div>
      {borrado && (
        <p className="mb-6 rounded-xl bg-bosque/15 px-4 py-3 text-sm font-medium text-bosque">Artículo borrado.</p>
      )}
      {articulos.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <p className="font-semibold text-marca">Todavía no hay artículos</p>
          <p className="mt-1 text-sm text-gris">Escribe el primero: consejos, relatos de salidas, novedades del club…</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {articulos.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white p-5">
              <Link
                href={`/admin/blog/${a.id}`}
                className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-crema sm:block"
              >
                {a.portada ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.portada.url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-[11px] text-gris">Sin foto</span>
                )}
              </Link>
              <div className="min-w-0 flex-1 basis-64">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    a.estado === "publicado" ? "bg-bosque/15 text-bosque" : "bg-linea text-gris"
                  }`}
                >
                  {a.estado === "publicado" ? "Publicado" : "Borrador"}
                </span>
                <Link href={`/admin/blog/${a.id}`} className="mt-1.5 block font-semibold text-marca hover:underline">
                  {a.titulo}
                </Link>
                <div className="text-sm text-gris first-letter:uppercase">{a.fecha && fechaLarga(a.fecha, true)}</div>
              </div>
              <div className="flex gap-2 text-sm">
                {a.estado === "publicado" && (
                  <Link href={`/blog/${a.id}`} target="_blank" className="rounded-full px-3 py-2 font-medium text-gris hover:bg-crema">
                    Ver ↗
                  </Link>
                )}
                <Link href={`/admin/blog/${a.id}`} className="btn btn-secundario px-4 py-2 text-marca">
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
