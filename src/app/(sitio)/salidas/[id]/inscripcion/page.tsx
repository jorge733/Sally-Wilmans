import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerAjustes, obtenerSalida } from "@/lib/data";
import { liberarReservasVencidas } from "@/lib/inscripciones";
import { hoyChile } from "@/lib/format";
import { cuposLibres, diaAbierto, diasSemana, porDia, salidaAbierta, semanaCompletaAbierta } from "@/lib/salida-utils";
import type { Salida } from "@/lib/types";
import { FormularioInscripcion } from "./FormularioInscripcion";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Inscripción", robots: { index: false } };

/** Siempre al día: los cupos se revisan en cada visita. */
export const dynamic = "force-dynamic";

/** Días que todavía se pueden elegir: uno por uno con precio por día, o los de cada semana completa abierta. */
function diasAbiertos(salida: Salida): string[] {
  const hoy = hoyChile();
  const conDias = porDia(salida);
  return salida.semanas.flatMap((w) =>
    conDias
      ? diasSemana(w).filter((f) => diaAbierto(w, f, hoy))
      : semanaCompletaAbierta(w, hoy)
        ? diasSemana(w)
        : [],
  );
}

export default async function PaginaInscripcion({ params }: Props) {
  const { id } = await params;
  // Así un cupo de una reserva que venció sin pagar vuelve a aparecer libre.
  await liberarReservasVencidas(id).catch((e) => console.error("No se pudieron liberar reservas vencidas", e));
  const [salida, ajustes] = await Promise.all([obtenerSalida(id), obtenerAjustes()]);
  if (!salida || salida.estado === "borrador") notFound();

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
            diasAbiertos={diasAbiertos(salida)}
            textoAutorizacion={ajustes.textoAutorizacion}
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
