import type { Metadata } from "next";
import { Amatic_SC, Fraunces, Inter } from "next/font/google";
import { SITIO, urlSitio } from "@/lib/site";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["500", "600"] });
const amatic = Amatic_SC({ variable: "--font-amatic", subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio()),
  title: { default: `${SITIO.nombre} · ${SITIO.bajada}`, template: `%s · ${SITIO.nombre}` },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  keywords: ["salidas al cerro", "niños", "senderismo", "naturaleza", "Waldorf", "Santiago", "club de verano"],
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: SITIO.nombre,
    title: `${SITIO.nombre} · ${SITIO.bajada}`,
    description: SITIO.descripcion,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITIO.nombre} · ${SITIO.bajada}`,
    description: SITIO.descripcion,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-CL"
      className={`${inter.variable} ${fraunces.variable} ${amatic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marca que hay JS antes de pintar, para ocultar lo que se revela al hacer scroll sin parpadeo. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
