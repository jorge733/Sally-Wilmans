import { obtenerContenido, obtenerFotosSitio } from "@/lib/data";
import { EditorFotos } from "./EditorFotos";
import { FormularioContenido } from "./FormularioContenido";

export const metadata = { title: "Contenido" };

export default async function Contenido() {
  const [contenido, fotos] = await Promise.all([obtenerContenido(), obtenerFotosSitio()]);
  return (
    <>
      <h1 className="text-3xl font-semibold text-marca">Contenido de la página</h1>
      <p className="mt-1 mb-6 text-gris">
        Las fotos y los textos de la página de inicio. Abre una sección para editarla.
      </p>

      <h2 className="mb-3 text-lg font-semibold">Fotos</h2>
      <details className="group mb-8 rounded-2xl bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 sm:px-6">
          <span className="text-acento transition group-open:rotate-90" aria-hidden>
            ▶
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold">Portada, «Quiénes somos» y galería</span>
            <span className="block text-sm text-gris">
              {fotos.galeria.length} fotos en la galería · se guardan al instante
            </span>
          </span>
        </summary>
        <div className="border-t border-linea p-5 sm:px-6">
          <EditorFotos fotosIniciales={fotos} />
        </div>
      </details>

      <h2 className="mb-3 text-lg font-semibold">Textos</h2>
      <FormularioContenido contenido={contenido} />
    </>
  );
}
