import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "firebase-admin/auth";
import { app } from "./firebase-admin";

export const COOKIE_SESION = "__session";
export const DURACION_SESION_MS = 5 * 24 * 60 * 60 * 1000;

const adminAuth = getAuth(app);

export function esAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.includes(email.toLowerCase());
}

export async function usuarioActual(): Promise<{ uid: string; email: string } | null> {
  const cookie = (await cookies()).get(COOKIE_SESION)?.value;
  if (!cookie) return null;
  try {
    const t = await adminAuth.verifySessionCookie(cookie, true);
    if (!esAdmin(t.email)) return null;
    return { uid: t.uid, email: t.email! };
  } catch {
    return null;
  }
}

/** Úsalo al inicio de cada página y acción del panel. */
export async function requerirAdmin() {
  const u = await usuarioActual();
  if (!u) redirect("/admin/login");
  return u;
}
