import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/site";

/** /robots.txt: deja pasar a Google por el sitio público y le cierra el panel, los pagos y las fichas. */
export default function robots(): MetadataRoute.Robots {
  const base = urlSitio();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/inscripcion/", "/salidas/*/inscripcion"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
