import type { Metadata } from "next";
import { OG_BASE } from "@/lib/site";
import { FormularioEncuesta } from "./FormularioEncuesta";

const titulo = "Encuesta para jóvenes de 13 a 16 años";
const descripcion =
  "Cuéntanos qué juegos, actividades y temas de conversación te gustaría tener en el Club de la Montaña.";

export const metadata: Metadata = {
  title: titulo,
  description: descripcion,
  openGraph: { ...OG_BASE, title: titulo, description: descripcion, url: "/encuesta" },
};

export default function PaginaEncuesta() {
  return (
    <div className="bg-crema py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="etiqueta">Grupo de 13 a 16 años</div>
        <h1 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">¿Qué te gustaría hacer en la montaña?</h1>
        <p className="mt-3 text-lg text-gris">
          Estamos armando un grupo para jóvenes y queremos que lo diseñes con nosotros. Marca lo que te guste: juegos,
          actividades y temas para conversar o debatir. Toma unos 3 minutos.
        </p>
        <FormularioEncuesta />
      </div>
    </div>
  );
}
