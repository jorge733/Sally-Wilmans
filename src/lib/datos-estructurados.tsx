/**
 * Datos estructurados (schema.org en JSON-LD) para Google: quién es el club,
 * sus preguntas frecuentes y cada salida como evento, con fecha, lugar, precio y cupos.
 * Así Google puede mostrar las salidas en sus resultados de eventos.
 */
import type { AjustesSitio, Salida } from "./types";
import { porSemanas, salidaAbierta } from "./salida-utils";
import { SITIO, urlSitio } from "./site";

type Json = Record<string, unknown>;

/** Inserta el JSON-LD en la página. Escapa "<" para que ningún texto pueda cerrar el <script>. */
export function JsonLd({ datos }: { datos: Json | Json[] }) {
  const json = JSON.stringify(Array.isArray(datos) ? { "@context": "https://schema.org", "@graph": datos } : { "@context": "https://schema.org", ...datos });
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\u003c") }} />;
}

/** Desfase horario de Santiago en esa fecha, "-03:00" o "-04:00". */
function desfaseChile(fecha: string): string {
  const nombre = new Intl.DateTimeFormat("en-US", { timeZone: "America/Santiago", timeZoneName: "longOffset" })
    .formatToParts(new Date(`${fecha}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  const m = nombre?.match(/GMT([+-]\d{2}:\d{2})/);
  return m ? m[1] : "-03:00";
}

const fechaHora = (fecha: string, hora: string) => `${fecha}T${hora}:00${desfaseChile(fecha)}`;

const idOrganizacion = () => `${urlSitio()}/#organizacion`;

export function organizacion(ajustes: AjustesSitio): Json {
  const base = urlSitio();
  const instagram = ajustes.instagram || SITIO.instagram;
  return {
    "@type": "Organization",
    "@id": idOrganizacion(),
    name: SITIO.nombre,
    alternateName: SITIO.nombreLargo,
    url: `${base}/`,
    logo: `${base}/icon.svg`,
    image: `${base}/opengraph-image`,
    description: SITIO.descripcion,
    foundingDate: String(SITIO.desde),
    founder: { "@type": "Person", name: SITIO.responsable },
    areaServed: { "@type": "City", name: "Santiago", containedInPlace: { "@type": "Country", name: "Chile" } },
    ...(ajustes.email ? { email: ajustes.email } : {}),
    ...(ajustes.whatsapp ? { telephone: `+${ajustes.whatsapp.replace(/\D/g, "")}` } : {}),
    sameAs: [`https://www.instagram.com/${instagram}/`],
  };
}

export function sitioWeb(): Json {
  return {
    "@type": "WebSite",
    "@id": `${urlSitio()}/#sitio`,
    name: SITIO.nombre,
    url: `${urlSitio()}/`,
    inLanguage: "es-CL",
    publisher: { "@id": idOrganizacion() },
  };
}

export function preguntasFrecuentes(lista: { p: string; r: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: lista.map((q) => ({
      "@type": "Question",
      name: q.p,
      acceptedAnswer: { "@type": "Answer", text: q.r },
    })),
  };
}

export function eventoSalida(s: Salida): Json {
  const base = urlSitio();
  const url = `${base}/salidas/${s.id}`;
  const fin = s.fechaFin || s.fecha;
  const fotos = s.fotos.map((f) => f.url).filter(Boolean);
  return {
    "@type": "Event",
    name: s.titulo,
    description: s.descripcion.replace(/\s+/g, " ").trim(),
    url,
    startDate: fechaHora(s.fecha, s.horaInicio),
    endDate: fechaHora(fin, s.horaFin),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "es-CL",
    image: fotos.length ? fotos : [`${url}/opengraph-image`],
    location: {
      "@type": "Place",
      name: s.lugar,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Santiago",
        addressRegion: "Región Metropolitana",
        addressCountry: "CL",
      },
    },
    typicalAgeRange: `${s.edadMin}-${s.edadMax}`,
    audience: { "@type": "PeopleAudience", suggestedMinAge: s.edadMin, suggestedMaxAge: s.edadMax },
    organizer: { "@type": "Organization", name: SITIO.nombre, url: `${base}/` },
    offers: {
      "@type": "Offer",
      url: `${url}/inscripcion`,
      price: s.precio,
      priceCurrency: "CLP",
      availability: salidaAbierta(s) ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      ...(porSemanas(s) ? { description: "Precio por niño desde (semana completa)" } : {}),
    },
  };
}
