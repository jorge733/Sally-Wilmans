/** Lado mayor con que se guardan las fotos. */
const LADO_MAX = 1920;

/** Achica la foto en el navegador para que suba rápido y pese poco. */
export async function achicar(archivo: File): Promise<File> {
  if (!archivo.type.startsWith("image/")) throw new Error(`"${archivo.name}" no es una imagen.`);
  let imagen: ImageBitmap;
  try {
    imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`No se pudo abrir "${archivo.name}". Prueba con una foto JPG o PNG.`);
  }
  const escala = Math.min(1, LADO_MAX / Math.max(imagen.width, imagen.height));
  const ancho = Math.round(imagen.width * escala);
  const alto = Math.round(imagen.height * escala);
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  lienzo.getContext("2d")!.drawImage(imagen, 0, 0, ancho, alto);
  imagen.close();
  const blob = await new Promise<Blob | null>((ok) => lienzo.toBlob(ok, "image/jpeg", 0.85));
  if (!blob) throw new Error(`No se pudo procesar "${archivo.name}".`);
  return new File([blob], archivo.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
