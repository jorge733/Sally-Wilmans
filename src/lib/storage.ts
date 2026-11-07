import "server-only";
import crypto from "node:crypto";
import { bucket } from "./firebase-admin";

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BYTES = 4 * 1024 * 1024;

/** Sube una imagen a Firebase Storage y devuelve su URL pública. */
export async function subirImagen(archivo: File, carpeta: string): Promise<{ url: string; path: string }> {
  if (!TIPOS.includes(archivo.type)) throw new Error("La foto debe ser JPG, PNG o WebP.");
  if (archivo.size > MAX_BYTES) throw new Error("La foto pesa más de 4 MB.");

  const ext = archivo.type === "image/png" ? "png" : archivo.type === "image/webp" ? "webp" : "jpg";
  const path = `public/${carpeta}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const token = crypto.randomUUID();
  const b = bucket();
  await b.file(path).save(Buffer.from(await archivo.arrayBuffer()), {
    contentType: archivo.type,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return { url: urlPublica(b.name, path, token), path };
}

function urlPublica(bucketName: string, path: string, token: string): string {
  const emu = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  const host = emu ? `http://${emu}` : "https://firebasestorage.googleapis.com";
  return `${host}/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** Copia una imagen ya subida a otra carpeta, con su propia URL. */
export async function copiarImagen(origen: string, carpeta: string): Promise<{ url: string; path: string }> {
  const ext = origen.split(".").pop() ?? "jpg";
  const path = `public/${carpeta}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const token = crypto.randomUUID();
  const b = bucket();
  const [meta] = await b.file(origen).getMetadata();
  await b.file(origen).copy(b.file(path), {
    // Estas opciones son el objeto destino: se repiten tipo y caché porque si no se pierden.
    contentType: meta.contentType,
    cacheControl: meta.cacheControl,
    metadata: { firebaseStorageDownloadTokens: token },
  });
  return { url: urlPublica(b.name, path, token), path };
}

export async function borrarImagen(path: string | null | undefined): Promise<void> {
  if (!path) return;
  await bucket()
    .file(path)
    .delete({ ignoreNotFound: true })
    .catch((e) => console.error("No se pudo borrar la foto", e));
}
