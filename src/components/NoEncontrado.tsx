import Link from "next/link";
import { Paisaje } from "@/components/Paisaje";
import { TarjetaSalida } from "@/components/TarjetaSalida";
import { salidasPublicas } from "@/lib/data";
import { varianteDe } from "@/lib/salida-utils";

/** Pantalla de "página no encontrada": un sendero perdido y el camino de vuelta. */
export async function NoEncontrado() {
  // Si Firestore falla, la 404 igual tiene que mostrarse.
  const salidas = await salidasPublicas().catch(() => []);
  const proximas = salidas.filter((s) => s.estado === "publicada").slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Paisaje variante={1} animado className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#fbf8f1]/10 via-[#fbf8f1]/55 to-[#fbf8f1]" />

        <div className="mx-auto max-w-3xl px-4 pt-[calc(var(--alto-encabezado)+4rem)] pb-20 text-center sm:px-6 md:pt-[calc(var(--alto-encabezado)+6rem)] md:pb-28">
          <p className="entrada mano text-[6.5rem] leading-none text-marca sm:text-[9rem]" aria-hidden>
            4
            <span className="inline-block text-acento" style={{ transform: "rotate(-8deg)" }}>
              0
            </span>
            4
          </p>
          <p className="entrada etiqueta mt-2" style={{ "--retraso": "120ms" } as React.CSSProperties}>
            Página no encontrada
          </p>
          <h1
            className="entrada mt-3 text-3xl font-semibold text-marca sm:text-5xl"
            style={{ "--retraso": "220ms" } as React.CSSProperties}
          >
            Uy, nos salimos del sendero
          </h1>
          <p
            className="entrada mx-auto mt-4 max-w-xl text-lg text-tinta/80"
            style={{ "--retraso": "320ms" } as React.CSSProperties}
          >
            La página que buscas no existe o cambió de lugar. Puede que la salida ya haya pasado o que el
            enlace tenga un error. Volvamos juntos al camino.
          </p>
          <div
            className="entrada mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ "--retraso": "420ms" } as React.CSSProperties}
          >
            <Link href="/" className="btn btn-primario">
              Volver al inicio
            </Link>
            <Link href="/#salidas" className="btn btn-secundario text-marca">
              Ver próximas fechas
            </Link>
          </div>
          <nav
            className="entrada mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gris"
            style={{ "--retraso": "520ms" } as React.CSSProperties}
            aria-label="Otras secciones"
          >
            <Link href="/#como-funciona" className="underline underline-offset-4 hover:text-tinta">
              Cómo funciona
            </Link>
            <Link href="/#nosotros" className="underline underline-offset-4 hover:text-tinta">
              Quiénes somos
            </Link>
            <Link href="/blog" className="underline underline-offset-4 hover:text-tinta">
              Blog
            </Link>
            <Link href="/#contacto" className="underline underline-offset-4 hover:text-tinta">
              Contacto
            </Link>
          </nav>
        </div>
      </section>

      {proximas.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <p className="etiqueta text-center">¿Buscabas una salida?</p>
          <h2 className="mt-2 text-center text-2xl font-semibold text-marca sm:text-3xl">
            Estas son las próximas
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proximas.map((s) => (
              <div key={s.id} className="flex [&>*]:w-full">
                <TarjetaSalida salida={s} indice={varianteDe(s.id)} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
