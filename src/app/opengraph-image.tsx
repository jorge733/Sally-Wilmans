import { ImageResponse } from "next/og";
import {
  COLORES,
  comoJpeg,
  FondoFoto,
  Logo,
  OG_TAMANO,
  OG_TIPO,
  fotoLocal,
  fuentesOg,
} from "@/lib/og";
import { PILARES, SITIO } from "@/lib/site";

export const alt = `${SITIO.nombre}: ${SITIO.bajada}`;
export const size = OG_TAMANO;
export const contentType = OG_TIPO;

const TITULO = "Niños en la montaña";
const BAJADA = `Salidas al cerro de ${SITIO.edades} en ${SITIO.ciudad.split(",")[0]}`;

export default async function ImagenSitio() {
  const [foto, fonts] = await Promise.all([
    fotoLocal("portada-puente.jpg"),
    fuentesOg(TITULO + BAJADA + PILARES.join("") + "clubdelamontana"),
  ]);

  const imagen = new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        fontFamily: "Inter",
      }}
    >
      <FondoFoto src={foto} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Logo tamano={68} />
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 38,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            {SITIO.nombre}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: -1.5,
            }}
          >
            {TITULO}
          </div>
          <div style={{ fontSize: 34, marginTop: 14, color: COLORES.crema }}>
            {BAJADA}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            {PILARES.map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: 999,
                  fontSize: 24,
                  background: COLORES.acento,
                  color: "#fff",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
  return comoJpeg(imagen);
}
