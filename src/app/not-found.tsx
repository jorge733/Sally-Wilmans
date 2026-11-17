import type { Metadata } from "next";
import { BotonWhatsapp, Encabezado, Pie } from "@/components/Estructura";
import { NoEncontrado } from "@/components/NoEncontrado";
import { obtenerAjustes } from "@/lib/data";

// Direcciones que no existen: queda fuera del layout del sitio, así que pone su propio encabezado y pie.
export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default async function NoEncontradoGeneral() {
  const ajustes = await obtenerAjustes();
  return (
    <>
      <Encabezado whatsapp={ajustes.whatsapp} />
      <main>
        <NoEncontrado />
      </main>
      <Pie ajustes={ajustes} />
      <BotonWhatsapp numero={ajustes.whatsapp} />
    </>
  );
}
