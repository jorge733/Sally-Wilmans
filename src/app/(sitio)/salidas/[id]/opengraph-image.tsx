import { ImageResponse } from "next/og";
import { obtenerSalida } from "@/lib/data";
import { clp, edades, fechaSalida } from "@/lib/format";
import {
  COLORES,
  comoJpeg,
  FondoCerros,
  FondoFoto,
  Logo,
  OG_TAMANO,
  OG_TIPO,
  fuentesOg,
} from "@/lib/og";
import { salidaAbierta } from "@/lib/salida-utils";
import { SITIO } from "@/lib/site";

export const alt = `Salida de ${SITIO.nombre}`;
export const size = OG_TAMANO;
export const contentType = OG_TIPO;
export const revalidate = 60;

const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export default async function ImagenSalida({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const s = await obtenerSalida((await params).id);
  const visible = s && s.estado !== "borrador";

  const titulo = visible ? s.titulo : SITIO.nombre;
  const fecha = visible ? capitalizar(fechaSalida(s)) : "";
  const detalle = visible
    ? `${s.lugar} · ${edades(s.edadMin, s.edadMax)}`
    : SITIO.bajada;
  const etiqueta = !visible
    ? null
    : salidaAbierta(s)
      ? `Inscripciones abiertas · ${clp(s.precio)}`
      : "Cupos completos";
  const largo = titulo.length;

  const fonts = await fuentesOg(titulo + fecha + detalle + (etiqueta ?? ""));

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
      {visible && s.fotoUrl ? <FondoFoto src={s.fotoUrl} /> : <FondoCerros />}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo tamano={60} />
            <div
              style={{
                fontFamily: "Fraunces",
                fontSize: 32,
                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              }}
            >
              {SITIO.nombre}
            </div>
          </div>
          {etiqueta && (
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 24,
                background:
                  etiqueta === "Cupos completos"
                    ? COLORES.tinta
                    : COLORES.acento,
              }}
            >
              {etiqueta}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {fecha && (
            <div style={{ fontSize: 34, color: COLORES.sol, marginBottom: 10 }}>
              {fecha}
            </div>
          )}
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: largo > 45 ? 60 : largo > 28 ? 72 : 84,
              lineHeight: 1.04,
              letterSpacing: -1.2,
              maxWidth: 1060,
            }}
          >
            {titulo}
          </div>
          <div style={{ fontSize: 32, marginTop: 16, color: COLORES.crema }}>
            {detalle}
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
  return comoJpeg(imagen);
}
