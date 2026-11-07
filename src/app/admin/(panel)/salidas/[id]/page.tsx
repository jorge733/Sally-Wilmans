import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerSalida } from "@/lib/data";
import { FormularioSalida } from "../FormularioSalida";
import { AccionesSalida } from "./AccionesSalida";
import { FotosSalida } from "./FotosSalida";

export const metadata = { title: "Editar salida" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creada?: string }> };

export default async function EditarSalida({ params, searchParams }: Props) {
  const [{ id }, { creada }] = await Promise.all([params, searchParams]);
  const salida = await obtenerSalida(id);
  if (!salida) notFound();

  return (
    <>
      <Link href="/admin" className="text-sm font-medium text-gris hover:text-tinta">
        ← Salidas
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold text-marca">{salida.titulo}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/salidas/${id}/inscritos`} className="btn btn-secundario px-4 py-2 text-sm text-marca">
            Inscritos ({salida.cuposTomados})
          </Link>
          {salida.estado !== "borrador" && (
            <Link href={`/salidas/${id}`} target="_blank" className="btn btn-secundario px-4 py-2 text-sm text-marca">
              Ver en el sitio ↗
            </Link>
          )}
        </div>
      </div>
      {creada && (
        <p className="mb-6 rounded-xl bg-bosque/15 px-4 py-3 text-sm font-medium text-bosque">
          Salida creada. {salida.estado === "publicada" ? "Ya aparece en el sitio (puede tardar hasta un minuto)." : ""}
        </p>
      )}
      <FormularioSalida salida={salida} />
      <FotosSalida id={id} fotosIniciales={salida.fotos} />
      <AccionesSalida id={id} />
    </>
  );
}
