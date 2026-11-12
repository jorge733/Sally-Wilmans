import type { MetadataRoute } from "next";
import { salidasPublicas } from "@/lib/data";
import { urlSitio } from "@/lib/site";

/** /sitemap.xml: inicio, encuesta y cada salida vigente. Se regenera cada hora. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio();
  const salidas = await salidasPublicas().catch(() => []);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...salidas.map((s) => ({
      url: `${base}/salidas/${s.id}`,
      lastModified: new Date(s.actualizadoEn || s.creadoEn),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${base}/encuesta`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
