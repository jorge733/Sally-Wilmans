import { BotonWhatsapp, Encabezado, Pie } from "@/components/Estructura";
import { AJUSTES_DEMO } from "@/lib/demo";

export default function LayoutSitio({ children }: { children: React.ReactNode }) {
  const ajustes = AJUSTES_DEMO;
  return (
    <>
      <div className="no-print bg-acento px-4 py-1.5 text-center text-xs font-medium text-white">
        Prototipo: los datos son de ejemplo y el pago está simulado.
      </div>
      <Encabezado />
      <main>{children}</main>
      <Pie ajustes={ajustes} />
      <BotonWhatsapp numero={ajustes.whatsapp} />
    </>
  );
}
