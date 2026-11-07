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
      <p className="mt-6 rounded-2xl border border-dashed border-linea p-6 text-sm text-gris">
        Las fotos se agregan después de crear la salida: al guardarla se abre su página de edición, con la sección
        <b> Fotos</b> para subirlas.
      </p>
    </>
  );
}
