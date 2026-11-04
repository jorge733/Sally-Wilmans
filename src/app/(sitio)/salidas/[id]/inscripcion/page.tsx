import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AJUSTES_DEMO, SALIDAS_DEMO, salidaDemo } from "@/lib/demo";
import { cuposLibres, salidaAbierta } from "@/lib/salida-utils";
import { FormularioInscripcion } from "./FormularioInscripcion";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Inscripción", robots: { index: false } };

export function generateStaticParams() {
  return SALIDAS_DEMO.map((s) => ({ id: s.id }));
}

export default async function PaginaInscripcion({ params }: Props) {
  const salida = salidaDemo((await params).id);
  if (!salida) notFound();

  return (
    <div className="bg-crema py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link href={`/salidas/${salida.id}`} className="text-sm font-medium text-gris hover:text-tinta">
          ← Volver a la salida
        </Link>
        {salidaAbierta(salida) ? (
          <FormularioInscripcion
            salida={salida}
            maxNinos={Math.min(cuposLibres(salida), 5)}
            textoAutorizacion={AJUSTES_DEMO.textoAutorizacion}
          />
        ) : (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-marca">Esta salida ya está completa</h1>
            <Link href="/#salidas" className="btn btn-primario mt-6">
              Ver otras salidas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
