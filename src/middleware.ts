import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, tokenValido } from "@/lib/sesion";

/** Protege todo /admin salvo la página de ingreso. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (await tokenValido(req.cookies.get(COOKIE_SESION)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
