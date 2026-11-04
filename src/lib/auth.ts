import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, DURACION_SESION_S, crearToken, tokenValido } from "./sesion";

/** Compara la clave ingresada con ADMIN_PASSWORD en tiempo constante. */
export function claveCorrecta(clave: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) throw new Error("Falta ADMIN_PASSWORD");
  const a = crypto.createHash("sha256").update(clave).digest();
  const b = crypto.createHash("sha256").update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function abrirSesion(): Promise<void> {
  (await cookies()).set(COOKIE_SESION, await crearToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_S,
  });
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}

export async function haySesion(): Promise<boolean> {
  return tokenValido((await cookies()).get(COOKIE_SESION)?.value);
}

/** Úsalo al inicio de cada página y acción del panel (el middleware es la primera barrera). */
export async function requerirAdmin(): Promise<void> {
  if (!(await haySesion())) redirect("/admin/login");
}
