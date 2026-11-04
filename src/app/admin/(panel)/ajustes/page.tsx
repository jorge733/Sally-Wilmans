import { obtenerAjustes } from "@/lib/data";
import { FormularioAjustes } from "./FormularioAjustes";

export const metadata = { title: "Ajustes" };

export default async function Ajustes() {
  const ajustes = await obtenerAjustes();
  return (
    <>
      <h1 className="text-3xl font-semibold text-marca">Ajustes</h1>
      <p className="mt-1 mb-6 text-gris">Datos de contacto que se muestran en el sitio y el texto de autorización.</p>
      <FormularioAjustes ajustes={ajustes} />
    </>
  );
}
