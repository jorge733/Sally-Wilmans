import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite correr un segundo servidor de desarrollo sin pisar la carpeta .next del primero.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // Las fotos de las salidas se suben por server actions (el navegador las achica antes, de a una).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
