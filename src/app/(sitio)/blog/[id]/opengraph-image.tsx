import { ImageResponse } from "next/og";
import { fechaArticulo, minutosLectura } from "@/lib/blog";
import { obtenerArticulo } from "@/lib/data";
import { COLORES, comoJpeg, FondoCerros, FondoFoto, Logo, OG_TAMANO, OG_TIPO, fuentesOg } from "@/lib/og";
import { SITIO } from "@/lib/site";

export const revalidate = 60;

/** El texto alternativo lleva el título del artículo (o la descripción de su portada). */
export async function generateImageMetadata({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Según la versión de Next, params llega como objeto o como promesa.
  const a = await obtenerArticulo((await params).id);
  const alt =
    a?.estado === "publicado" ? a.portada?.alt || `${a.titulo} · Blog de ${SITIO.nombre}` : `Blog de ${SITIO.nombre}`;
  return [{ id: "portada", alt, size: OG_TAMANO, contentType: OG_TIPO }];
}

/** Tarjeta para compartir un artículo: su portada (o los cerros), el título, la fecha y la autora. */
export default async function ImagenArticulo({ params }: { params: Promise<{ id: string }> }) {
  const a = await obtenerArticulo((await params).id);
  const size = OG_TAMANO;
  const visible = a?.estado === "publicado" ? a : null;

  const titulo = visible?.titulo ?? SITIO.nombre;
  const datos = visible ? `${fechaArticulo(visible.fecha)} · ${minutosLectura(visible.cuerpo)} min de lectura` : "";
  const autora = `Por ${SITIO.responsable}`;
  const largo = titulo.length;
  const fonts = await fuentesOg(titulo + datos + autora + "Blog");

  const imagen = new ImageResponse(
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", fontFamily: "Inter" }}>
      {visible?.portada ? <FondoFoto src={visible.portada.url} /> : <FondoCerros />}
      {!visible?.portada && (
        // Sin foto, oscurece a la izquierda para que el título se lea sobre los cerros.
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: "linear-gradient(100deg, rgba(31,51,35,0.92) 0%, rgba(31,51,35,0.7) 55%, rgba(31,51,35,0.2) 90%)",
          }}
        />
      )}
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
          {visible && (
            <div
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 999,
                fontSize: 24,
                background: COLORES.acento,
              }}
            >
              Blog
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {datos && <div style={{ fontSize: 28, color: COLORES.sol, marginBottom: 12 }}>{datos}</div>}
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: largo > 70 ? 54 : largo > 45 ? 62 : largo > 28 ? 72 : 84,
              lineHeight: 1.05,
              letterSpacing: -1.2,
              maxWidth: 1060,
            }}
          >
            {titulo}
          </div>
          <div style={{ fontSize: 30, marginTop: 18, color: COLORES.crema }}>
            {visible ? autora : SITIO.bajada}
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
  return comoJpeg(imagen);
}
