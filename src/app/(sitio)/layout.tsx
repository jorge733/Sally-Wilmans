import { AnimacionesScroll } from "@/components/AnimacionesScroll";
import { BotonWhatsapp, Encabezado, Pie } from "@/components/Estructura";
import { obtenerAjustes } from "@/lib/data";

export default async function LayoutSitio({ children }: { children: React.ReactNode }) {
  const ajustes = await obtenerAjustes();
  return (
    <>
      <Encabezado />
      <main>{children}</main>
      <Pie ajustes={ajustes} />
      <BotonWhatsapp numero={ajustes.whatsapp} />
      <AnimacionesScroll />
    </>
  );
}
