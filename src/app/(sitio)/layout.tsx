import { BotonWhatsapp, Encabezado, Pie } from "@/components/Estructura";
import { obtenerAjustes } from "@/lib/data";

export default async function LayoutSitio({ children }: { children: React.ReactNode }) {
  const ajustes = await obtenerAjustes();
  return (
    <>
      <div className="no-print bg-acento px-4 py-1.5 text-center text-xs font-medium text-white">
        Sitio en construcción: las fechas son de ejemplo y el pago está simulado.
      </div>
      <Encabezado />
      <main>{children}</main>
      <Pie ajustes={ajustes} />
      <BotonWhatsapp numero={ajustes.whatsapp} />
    </>
  );
}
