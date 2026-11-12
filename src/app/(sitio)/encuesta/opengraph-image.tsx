import { ImageResponse } from "next/og";
import { COLORES, comoJpeg, FondoCerros, Logo, OG_TAMANO, OG_TIPO, fuentesOg } from "@/lib/og";
import { SITIO } from "@/lib/site";

export const alt = "Encuesta para jóvenes de 13 a 16 años del Club de la Montaña";
export const size = OG_TAMANO;
export const contentType = OG_TIPO;

const ETIQUETA = "Encuesta · 13 a 16 años";
const TITULO = "¿Qué te gustaría hacer en la montaña?";
const BAJADA = "Ayúdanos a armar el nuevo grupo de jóvenes";
const TEMAS = ["Juegos", "Actividades", "Conversar", "Debatir"];
const DURACION = "Toma 3 minutos";

export default async function ImagenEncuesta() {
  const fonts = await fuentesOg(ETIQUETA + TITULO + BAJADA + TEMAS.join("") + DURACION + "→✓");

  const imagen = new ImageResponse(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", fontFamily: "Inter" }}>
      <FondoCerros />
      {/* Oscurece arriba a la izquierda para que el texto se lea sobre los cerros */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(100deg, rgba(31,51,35,0.92) 0%, rgba(31,51,35,0.7) 55%, rgba(31,51,35,0) 85%)",
        }}
      />
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
          padding: "52px 64px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo tamano={60} />
            <div style={{ fontFamily: "Fraunces", fontSize: 32 }}>{SITIO.nombre}</div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 24,
              background: COLORES.acento,
            }}
          >
            {ETIQUETA}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 76,
              lineHeight: 1.04,
              letterSpacing: -1.2,
              maxWidth: 860,
            }}
          >
            {TITULO}
          </div>
          <div style={{ fontSize: 32, marginTop: 16, color: COLORES.crema }}>{BAJADA}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30 }}>
            {TEMAS.map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: 999,
                  fontSize: 24,
                  background: "rgba(255,255,255,0.14)",
                  border: "2px solid rgba(255,255,255,0.35)",
                }}
              >
                {"✓ " + t}
              </div>
            ))}
            <div style={{ display: "flex", marginLeft: 12, fontSize: 24, color: COLORES.sol }}>{DURACION}</div>
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
  return comoJpeg(imagen);
}
