import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Estructura";
import { haySesion } from "@/lib/auth";
import { FormularioIngreso } from "./FormularioIngreso";

export const metadata: Metadata = { title: "Entrar" };

export default async function Ingreso() {
  if (await haySesion()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl shadow-marca/5">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold text-marca">Panel del club</h1>
        <p className="mt-1 text-sm text-gris">Ingresa tu clave para administrar las salidas.</p>
        <FormularioIngreso />
      </div>
    </main>
  );
}
