import type { MetadataRoute } from "next";
import { articulosPublicados, salidasPublicas } from "@/lib/data";
import { urlSitio } from "@/lib/site";

/** /sitemap.xml: inicio, salidas vigentes, blog y encuesta. Se regenera cada hora. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio();
  const [salidas, articulos] = await Promise.all([
    salidasPublicas().catch(() => []),
    articulosPublicados().catch(() => []),
  ]);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...salidas.map((s) => ({
      url: `${base}/salidas/${s.id}`,
      lastModified: new Date(s.actualizadoEn || s.creadoEn),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    ...articulos.map((a) => ({
      url: `${base}/blog/${a.id}`,
      lastModified: new Date(a.actualizadoEn || a.creadoEn),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    { url: `${base}/encuesta`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/devoluciones`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
