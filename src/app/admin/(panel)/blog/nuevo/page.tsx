import Link from "next/link";
import { hoyChile } from "@/lib/format";
import { EditorArticulo } from "../EditorArticulo";

export const metadata = { title: "Nuevo artículo" };

export default function NuevoArticulo() {
  return (
    <>
      <Link href="/admin/blog" className="text-sm font-medium text-gris hover:text-tinta">
        ← Blog
      </Link>
      <h1 className="mt-2 mb-6 text-3xl font-semibold text-marca">Nuevo artículo</h1>
      <EditorArticulo hoy={hoyChile()} />
    </>
  );
}
