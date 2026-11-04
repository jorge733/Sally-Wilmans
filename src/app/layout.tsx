import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SITIO, urlSitio } from "@/lib/site";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio()),
  title: { default: `${SITIO.nombre} · ${SITIO.bajada}`, template: `%s · ${SITIO.nombre}` },
  description: SITIO.descripcion,
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: SITIO.nombre,
    title: SITIO.nombre,
    description: SITIO.descripcion,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
