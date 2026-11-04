/**
 * Cookie de sesión del panel, firmada con HMAC-SHA256 (SESSION_SECRET).
 * Usa Web Crypto para funcionar igual en el middleware (edge) y en el servidor.
 */
export const COOKIE_SESION = "cdm_sesion";
export const DURACION_SESION_S = 7 * 24 * 60 * 60;

const enc = new TextEncoder();

function base64url(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function firmar(mensaje: string, secreto: string): Promise<string> {
  const clave = await crypto.subtle.importKey("raw", enc.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return base64url(await crypto.subtle.sign("HMAC", clave, enc.encode(mensaje)));
}

function secreto(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("Falta SESSION_SECRET (mínimo 32 caracteres)");
  return s;
}

/** Token "expira.firma". */
export async function crearToken(): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + DURACION_SESION_S);
  return `${exp}.${await firmar(`admin.${exp}`, secreto())}`;
}

export async function tokenValido(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, firma] = token.split(".");
  if (!exp || !firma || Number(exp) < Date.now() / 1000) return false;
  try {
    const esperada = await firmar(`admin.${exp}`, secreto());
    if (esperada.length !== firma.length) return false;
    let dif = 0;
    for (let i = 0; i < firma.length; i++) dif |= esperada.charCodeAt(i) ^ firma.charCodeAt(i);
    return dif === 0;
  } catch {
    return false;
  }
}
