import { NoEncontrado } from "@/components/NoEncontrado";

// Cuando una salida, inscripción o artículo no existe (notFound() dentro del sitio).
// El título lo pone el generateMetadata de cada página: Next no aplica metadata en un not-found anidado.
export default function NoEncontradoSitio() {
  return <NoEncontrado />;
}
