import { ImageResponse } from "next/og";
import { COLORES, comoJpeg, FondoFoto, Logo, OG_TAMANO, OG_TIPO, fotoLocal, fuentesOg } from "@/lib/og";
import { SITIO } from "@/lib/site";

export const alt = `Blog de ${SITIO.nombre}`;
export const size = OG_TAMANO;
export const contentType = OG_TIPO;

const TITULO = "Desde el cerro";
const BAJADA = "Consejos, relatos de salidas y novedades del club";
const TEMAS = ["Naturaleza", "Juego libre", "Crianza", "Salidas"];

export default async function ImagenBlog() {
  const [foto, fonts] = await Promise.all([
    fotoLocal("galeria-sendero.jpg"),
    fuentesOg(TITULO + BAJADA + TEMAS.join("") + "Blog"),
  ]);

  const imagen = new ImageResponse(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", fontFamily: "Inter" }}>
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
          padding: "52px 64px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo tamano={60} />
            <div style={{ fontFamily: "Fraunces", fontSize: 32, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
              {SITIO.nombre}
            </div>
          </div>
          <div style={{ display: "flex", padding: "10px 24px", borderRadius: 999, fontSize: 24, background: COLORES.acento }}>
            Blog
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Fraunces", fontSize: 88, lineHeight: 1.02, letterSpacing: -1.5 }}>{TITULO}</div>
          <div style={{ fontSize: 34, marginTop: 14, color: COLORES.crema }}>{BAJADA}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
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
                {t}
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
