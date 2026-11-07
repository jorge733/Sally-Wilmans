import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite correr un segundo servidor de desarrollo sin pisar la carpeta .next del primero.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;
