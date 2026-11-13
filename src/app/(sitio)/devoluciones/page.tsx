import type { Metadata } from "next";
import { IconoWhatsapp } from "@/components/Iconos";
import { obtenerAjustes } from "@/lib/data";
import { POLITICA_DEVOLUCIONES, TITULO_DEVOLUCIONES } from "@/lib/devoluciones";
import { linkWhatsapp } from "@/lib/format";
import { OG_BASE } from "@/lib/site";

const descripcion =
  "Con 24 horas de aviso devolvemos el 100%. Si avisas el mismo día, el niño recupera el día en otra salida. Si el club suspende, eliges otra fecha o la devolución.";

export const metadata: Metadata = {
  title: TITULO_DEVOLUCIONES,
  description: descripcion,
  alternates: { canonical: "/devoluciones" },
  openGraph: { ...OG_BASE, title: TITULO_DEVOLUCIONES, description: descripcion, url: "/devoluciones" },
};

export default async function PaginaDevoluciones() {
  const ajustes = await obtenerAjustes();
  return (
    <div className="bg-crema py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="etiqueta">Inscripciones</div>
        <h1 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">{TITULO_DEVOLUCIONES}</h1>
        <p className="mt-3 text-lg text-gris">
          Sabemos que a veces los planes cambian. Esto es lo que pasa con lo pagado si no pueden venir o si nosotros
          suspendemos una salida.
        </p>

        <div className="mt-8 space-y-4">
          {POLITICA_DEVOLUCIONES.map((s) => (
            <section key={s.titulo} className="rounded-2xl bg-white p-6">
              <h2 className="text-lg font-semibold text-marca">{s.titulo}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-gris">
                {s.puntos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {ajustes.whatsapp && (
          <a
            href={linkWhatsapp(ajustes.whatsapp, "Hola, necesito avisar que mi hijo/a no podrá asistir a la salida")}
            target="_blank"
            rel="noopener"
            className="btn btn-primario mt-8"
          >
            <IconoWhatsapp className="size-5" /> Avisar por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
