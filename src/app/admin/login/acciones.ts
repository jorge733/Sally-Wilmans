"use server";

import { redirect } from "next/navigation";
import { abrirSesion, claveCorrecta } from "@/lib/auth";

export async function ingresar(_: { error: string } | null, form: FormData) {
  const clave = String(form.get("clave") ?? "");
  if (!claveCorrecta(clave)) {
    // Pausa para frenar intentos repetidos.
    await new Promise((r) => setTimeout(r, 1500));
    return { error: "La clave no es correcta." };
  }
  await abrirSesion();
  redirect("/admin");
}
