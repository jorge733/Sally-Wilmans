import { obtenerContenido } from "@/lib/data";
import { FormularioContenido } from "./FormularioContenido";

export const metadata = { title: "Contenido" };

export default async function Contenido() {
  const contenido = await obtenerContenido();
  return (
    <>
      <h1 className="text-3xl font-semibold text-marca">Contenido de la página</h1>
      <p className="mt-1 mb-6 text-gris">
        Los textos de la página de inicio, sección por sección. Abre una sección para editarla y guarda al final.
      </p>
      <FormularioContenido contenido={contenido} />
    </>
  );
}
