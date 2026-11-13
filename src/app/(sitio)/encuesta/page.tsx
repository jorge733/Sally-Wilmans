import type { Metadata } from "next";
import Link from "next/link";
import { ENCUESTA_ABRE, ENCUESTA_CIERRA, estadoEncuesta, fechaEncuesta } from "@/lib/encuesta";
import { hoyChile } from "@/lib/format";
import { OG_BASE } from "@/lib/site";
import { FormularioEncuesta } from "./FormularioEncuesta";

const titulo = "Encuesta para jóvenes de 13 a 16 años";
// Al compartir el link (WhatsApp, Instagram) se ve esta pregunta, que invita más que el título de la página.
const tituloCompartir = "¿Qué te gustaría hacer en la montaña?";
const descripcion =
  "¿Tienes entre 13 y 16 años? Ayúdanos a armar el nuevo grupo de jóvenes del Club de la Montaña: elige juegos, actividades y temas para conversar o debatir. Toma 3 minutos.";

export const metadata: Metadata = {
  title: titulo,
  description: descripcion,
  alternates: { canonical: "/encuesta" },
  // La imagen sale de opengraph-image.tsx de esta carpeta.
  openGraph: { ...OG_BASE, title: tituloCompartir, description: descripcion, url: "/encuesta" },
  twitter: { card: "summary_large_image", title: tituloCompartir, description: descripcion },
};

/** Se revisa la fecha en cada visita para abrir y cerrar la encuesta solo. */
export const dynamic = "force-dynamic";

export default function PaginaEncuesta() {
  const estado = estadoEncuesta(hoyChile());
  return (
    <div className="bg-crema py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="etiqueta">Grupo de 13 a 16 años</div>
        <h1 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">¿Qué te gustaría hacer en la montaña?</h1>
        <p className="mt-3 text-lg text-gris">
          Estamos armando un grupo para jóvenes y queremos que lo diseñes con nosotros. Marca lo que te guste: juegos,
          actividades y temas para conversar o debatir. Toma unos 3 minutos.
        </p>
        <p className="mt-2 text-sm font-medium text-bosque">
          Recibimos respuestas del {fechaEncuesta(ENCUESTA_ABRE)} al {fechaEncuesta(ENCUESTA_CIERRA)}.
        </p>
        {estado === "abierta" ? (
          <FormularioEncuesta />
        ) : (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center">
            <div className="mano text-4xl text-acento">{estado === "pronto" ? "¡Muy pronto!" : "¡Gracias!"}</div>
            <h2 className="mt-2 text-2xl font-semibold text-marca">
              {estado === "pronto"
                ? `La encuesta abre el ${fechaEncuesta(ENCUESTA_ABRE)}`
                : "La encuesta ya cerró"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-gris">
              {estado === "pronto"
                ? "Vuelve ese día para contarnos qué te gustaría hacer en el grupo de jóvenes."
                : "Con las respuestas que recibimos estamos armando el grupo de jóvenes. Pronto contaremos más."}
            </p>
            <Link href="/" className="btn btn-primario mt-6">
              Ir al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
