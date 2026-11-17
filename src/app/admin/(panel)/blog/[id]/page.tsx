import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerArticulo } from "@/lib/data";
import { hoyChile } from "@/lib/format";
import { EditorArticulo } from "../EditorArticulo";

export const metadata = { title: "Editar artículo" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> };

export default async function EditarArticulo({ params, searchParams }: Props) {
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
  const articulo = await obtenerArticulo(id);
  if (!articulo) notFound();

  return (
    <>
      <Link href="/admin/blog" className="text-sm font-medium text-gris hover:text-tinta">
        ← Blog
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold text-marca">{articulo.titulo}</h1>
        {articulo.estado === "publicado" && (
          <Link href={`/blog/${id}`} target="_blank" className="btn btn-secundario px-4 py-2 text-sm text-marca">
            Ver en el sitio ↗
          </Link>
        )}
      </div>
      {creado && (
        <p className="mb-6 rounded-xl bg-bosque/15 px-4 py-3 text-sm font-medium text-bosque">
          {articulo.estado === "publicado"
            ? "Artículo publicado. Ya aparece en el blog del sitio."
            : "Artículo guardado como borrador. Cuando esté listo, márcalo como Publicado y guarda."}
        </p>
      )}
      <EditorArticulo articulo={articulo} hoy={hoyChile()} />
    </>
  );
}
