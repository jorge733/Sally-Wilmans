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

  const emu = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  const host = emu ? `http://${emu}` : "https://firebasestorage.googleapis.com";
  const url = `${host}/v0/b/${b.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  return { url, path };
}

export async function borrarImagen(path: string | null | undefined): Promise<void> {
  if (!path) return;
  await bucket()
    .file(path)
    .delete({ ignoreNotFound: true })
    .catch((e) => console.error("No se pudo borrar la foto", e));
}
