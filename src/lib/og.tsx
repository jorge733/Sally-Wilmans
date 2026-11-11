/**
 * Piezas comunes de las imágenes para compartir (Open Graph): cuando alguien
 * pega el link en WhatsApp, Instagram o Facebook, se ve esta tarjeta.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITIO } from "@/lib/site";

export const OG_TAMANO = { width: 1200, height: 630 };
export const OG_TIPO = "image/png";

export const COLORES = {
  tinta: "#23291f",
  marca: "#2f4a34",
  marcaClaro: "#d5dfcc",
  acento: "#c0663a",
  crema: "#f3eddf",
  sol: "#f6c68f",
};

type Fuente = {
  name: string;
  data: ArrayBuffer;
  weight: 500 | 600;
  style: "normal";
};

/** Baja de Google Fonts solo las letras que se usan. Si falla, la imagen sale con la fuente por defecto. */
async function fuenteGoogle(
  familia: string,
  peso: 500 | 600,
  texto: string,
): Promise<Fuente | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${familia.replace(/ /g, "+")}:wght@${peso}&text=${encodeURIComponent(texto)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(
      /src: url\((.+?)\) format\('(opentype|truetype)'\)/,
    )?.[1];
    if (!src) return null;
    const res = await fetch(src);
    if (!res.ok) return null;
    return {
      name: familia,
      data: await res.arrayBuffer(),
      weight: peso,
      style: "normal",
    };
  } catch {
    return null;
  }
}

export async function fuentesOg(texto: string): Promise<Fuente[]> {
  const todo = texto + SITIO.nombre + "0123456789·";
  const fuentes = await Promise.all([
    fuenteGoogle("Fraunces", 600, todo),
    fuenteGoogle("Inter", 500, todo),
  ]);
  return fuentes.filter((f): f is Fuente => f !== null);
}

/** Foto local de src/assets como data URL, para meterla en la imagen. */
export async function fotoLocal(nombre: string): Promise<string> {
  const datos = await readFile(join(process.cwd(), "src/assets", nombre));
  return `data:image/jpeg;base64,${datos.toString("base64")}`;
}

/** El cerrito del ícono del sitio, en chico. */
export function Logo({ tamano = 64 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill={COLORES.marca} />
      <circle cx="46" cy="19" r="6" fill={COLORES.sol} />
      <path d="M6 52 L24 24 L33 37 L40 28 L58 52 Z" fill={COLORES.marcaClaro} />
      <path d="M24 24 L19.5 31 L23 29.5 L26 32 L28.5 30 Z" fill="#fbf8f1" />
      <path d="M6 52 L22 40 L34 46 L46 39 L58 52 Z" fill={COLORES.acento} />
    </svg>
  );
}

/** Foto de fondo a todo el ancho con un degradado oscuro abajo para que el texto se lea. */
export function FondoFoto({ src }: { src: string }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex" }}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={src} width={OG_TAMANO.width} height={OG_TAMANO.height} style={{ objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(to bottom, rgba(15,22,15,0.5) 0%, rgba(15,22,15,0.05) 28%, rgba(15,22,15,0.55) 55%, rgba(15,22,15,0.92) 100%)",
        }}
      />
    </div>
  );
}

/** Cerros planos en los colores del sitio, para cuando no hay foto. */
export function FondoCerros() {
  return (
    <svg
      width={OG_TAMANO.width}
      height={OG_TAMANO.height}
      viewBox="0 0 1200 630"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <rect width="1200" height="630" fill={COLORES.marca} />
      <circle cx="1010" cy="225" r="64" fill={COLORES.sol} opacity="0.9" />
      <path
        d="M0 470 L260 210 L420 360 L600 170 L820 400 L980 260 L1200 450 L1200 630 L0 630 Z"
        fill="#3d5c41"
      />
      <path
        d="M600 170 L555 215 L585 205 L610 225 L640 210 Z"
        fill="#fbf8f1"
        opacity="0.85"
      />
      <path
        d="M0 540 L220 430 L470 500 L720 410 L960 490 L1200 420 L1200 630 L0 630 Z"
        fill="#26402b"
      />
    </svg>
  );
}
