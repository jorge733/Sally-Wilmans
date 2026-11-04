import Link from "next/link";
import { FormularioSalida } from "../FormularioSalida";

export const metadata = { title: "Nueva salida" };

export default function NuevaSalida() {
  return (
    <>
      <Link href="/admin" className="text-sm font-medium text-gris hover:text-tinta">
        ← Salidas
      </Link>
      <h1 className="mt-2 mb-6 text-3xl font-semibold text-marca">Nueva salida</h1>
      <FormularioSalida />
    </>
  );
}
