import Link from "next/link";
import {
  IconoCorazon,
  IconoCorreo,
  IconoEscudo,
  IconoFlecha,
  IconoGrupo,
  IconoInstagram,
  IconoSendero,
  IconoWhatsapp,
} from "@/components/Iconos";
import { Paisaje } from "@/components/Paisaje";
import { TarjetaSalida } from "@/components/TarjetaSalida";
import { AJUSTES_DEMO, SALIDAS_DEMO } from "@/lib/demo";
import { linkWhatsapp } from "@/lib/format";
import { CUIDADOS, PASOS, PREGUNTAS, SITIO } from "@/lib/site";

const ICONOS_CUIDADO = [IconoGrupo, IconoEscudo, IconoCorazon, IconoSendero];

export default function Inicio() {
  const salidas = SALIDAS_DEMO;
  const ajustes = AJUSTES_DEMO;

  return (
    <>
      {/* Portada */}
      <section className="relative isolate overflow-hidden bg-marca text-white">
        <Paisaje variante={0} conNieve className="absolute inset-0 -z-10 size-full opacity-95" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-marca/90 via-marca/60 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-28 sm:px-6 md:pt-28 md:pb-40">
          <p className="etiqueta !text-[#ffd7c7]">Taller de montaña para niños</p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-[1.08] font-semibold sm:text-5xl md:text-6xl">
            Salidas a la montaña donde los niños aprenden a cuidarla
          </h1>
          <p className="mt-6 max-w-xl text-lg text-marca-claro">
            Caminatas guiadas en grupos pequeños, con adultos a cargo y rutas pensadas para cada edad. Inscribe a
            tus hijos y paga en línea en pocos minutos.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#salidas" className="btn btn-primario">
              Ver próximas salidas <IconoFlecha />
            </Link>
            <Link href="#como-funciona" className="btn btn-secundario text-white">
              Cómo funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Próximas salidas */}
      <section id="salidas" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="etiqueta">Calendario</p>
              <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">Próximas salidas</h2>
            </div>
            <p className="max-w-md text-gris">
              Cada salida tiene cupos limitados. Cuando se llenan, la inscripción se cierra sola.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {salidas.map((s, i) => (
              <TarjetaSalida key={s.id} salida={s} indice={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-20 bg-crema py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="etiqueta">Inscripción</p>
          <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">Inscribir es así de simple</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p, i) => (
              <li key={p.titulo} className="rounded-2xl bg-white p-6">
                <div className="flex size-10 items-center justify-center rounded-full bg-marca font-serif text-lg font-semibold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-gris">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Quiénes somos */}
      <section id="nosotros" className="scroll-mt-20 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl">
              <Paisaje variante={1} className="size-full" />
            </div>
            <div className="absolute -right-3 -bottom-5 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-marca/10 sm:-right-6">
              <div className="font-serif text-3xl font-semibold text-acento">+8 años</div>
              <div className="text-sm text-gris">llevando niños al cerro</div>
            </div>
          </div>
          <div>
            <p className="etiqueta">Quiénes somos</p>
            <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">
              Hola, soy {SITIO.responsable.split(" ")[0]}
            </h2>
            <div className="mt-5 space-y-4 text-gris">
              <p>
                Club de la Montaña nació para que los niños vivan la montaña de cerca: caminar, cansarse, mirar
                el paisaje con calma y volver a casa con ganas de repetir.
              </p>
              <p>
                En cada salida trabajamos la autonomía, el compañerismo y el respeto por la naturaleza. Las rutas
                se eligen según la edad del grupo, y siempre vamos con guías que conocen el lugar.
              </p>
              <p className="text-sm italic">
                (Texto de ejemplo: Sally lo reemplaza por su historia, su experiencia y su equipo.)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cuidados */}
      <section className="bg-marca py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="etiqueta !text-[#ffd7c7]">Seguridad</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold sm:text-4xl">Cómo cuidamos a los niños</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {CUIDADOS.map((c, i) => {
              const Icono = ICONOS_CUIDADO[i];
              return (
                <div key={c.titulo}>
                  <Icono className="size-8 text-[#ffb39c]" />
                  <h3 className="mt-4 text-lg font-semibold">{c.titulo}</h3>
                  <p className="mt-2 text-sm text-marca-claro">{c.texto}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="etiqueta">Galería</p>
          <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">Así son nuestras salidas</h2>
          <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
            {[0, 1, 2, 3, 1, 2].map((v, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""} ${i === 3 ? "md:row-span-2" : ""}`}
              >
                <Paisaje variante={v + i} className="size-full" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gris">
            Aquí van las fotos de las salidas que Sally suba desde su panel (con permiso de las familias).
          </p>
        </div>
      </section>

      {/* Preguntas */}
      <section className="bg-crema py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="etiqueta text-center">Preguntas frecuentes</p>
          <h2 className="mt-2 text-center text-3xl font-semibold text-marca sm:text-4xl">¿Tienes dudas?</h2>
          <div className="mt-10 divide-y divide-linea rounded-2xl bg-white">
            {PREGUNTAS.map((q) => (
              <details key={q.p} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q.p}
                  <span className="text-xl text-acento transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-gris">{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-8 rounded-3xl bg-acento p-8 text-white sm:p-12 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">¿Conversamos?</h2>
              <p className="mt-3 max-w-md text-white/85">
                Escríbenos si tienes preguntas sobre una salida, las edades o lo que tu hijo necesita llevar.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={linkWhatsapp(ajustes.whatsapp)}
                className="btn bg-white text-acento hover:bg-crema"
                target="_blank"
                rel="noopener"
              >
                <IconoWhatsapp className="size-5" /> Escribir por WhatsApp
              </a>
              <a href={`mailto:${ajustes.email}`} className="btn btn-secundario text-white">
                <IconoCorreo /> {ajustes.email}
              </a>
              <a
                href={`https://instagram.com/${ajustes.instagram}`}
                className="btn btn-secundario text-white"
                target="_blank"
                rel="noopener"
              >
                <IconoInstagram /> @{ajustes.instagram}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
