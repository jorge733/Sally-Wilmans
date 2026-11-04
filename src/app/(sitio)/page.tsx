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
import { varianteDe } from "@/lib/salida-utils";
import { obtenerAjustes, salidasPublicas } from "@/lib/data";
import { linkWhatsapp } from "@/lib/format";
import { CUIDADOS, PASOS, PILARES, PREGUNTAS, SITIO } from "@/lib/site";

const ICONOS_CUIDADO = [IconoGrupo, IconoEscudo, IconoCorazon, IconoSendero];

function Hoja({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21c0-7 0-11 0-17M12 9c-3-1-5-3-5.5-5.5C9.5 4 11.5 6 12 9Zm0 4c3-1 5-3 5.5-5.5-3 .5-5 2.5-5.5 5.5Zm0 4c-3-1-5-3-5.5-5.5C9.5 12 11.5 14 12 17Z" />
    </svg>
  );
}

/** Se regenera cada minuto para mostrar fechas y cupos al día. */
export const revalidate = 60;

export default async function Inicio() {
  const [salidas, ajustes] = await Promise.all([salidasPublicas(), obtenerAjustes()]);
  const anios = new Date().getFullYear() - SITIO.desde;

  return (
    <>
      {/* Portada */}
      <section className="relative isolate overflow-hidden bg-marca text-white">
        <Paisaje variante={0} conNieve className="absolute inset-0 -z-10 size-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-marca/95 via-marca/70 to-marca/10" />
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-6 md:pt-24 md:pb-36">
          <p className="mano text-2xl text-[#f6c68f] sm:text-3xl">{SITIO.nombreLargo}</p>
          <h1 className="mt-3 max-w-2xl text-4xl leading-[1.08] font-semibold sm:text-5xl md:text-6xl">
            Llevamos a los niños al cerro a ser niños
          </h1>
          <p className="mt-6 max-w-xl text-lg text-marca-claro">
            Salidas a la naturaleza para niños y niñas de {SITIO.edades}: jugar, moverse, explorar, asombrarse y
            compartir con otros niños, lejos de las pantallas.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#salidas" className="btn btn-primario">
              Ver próximas fechas <IconoFlecha />
            </Link>
            <Link href="#nosotros" className="btn btn-secundario text-white">
              Conoce el club
            </Link>
          </div>
          <p className="mt-10 text-sm text-marca-claro">
            Inspirado en la pedagogía Waldorf · {SITIO.ciudad} · Desde {SITIO.desde}
          </p>
        </div>
      </section>

      {/* Pilares */}
      <section className="border-b border-linea bg-crema">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-3 px-4 py-6 sm:px-6 md:grid-cols-4">
          {PILARES.map((p) => (
            <li key={p} className="mano flex items-center justify-center gap-2 text-2xl text-marca uppercase sm:text-3xl">
              <Hoja className="size-5 text-bosque" /> {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Próximas fechas */}
      <section id="salidas" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="etiqueta">Calendario</p>
              <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">Próximas fechas</h2>
            </div>
            <p className="max-w-md text-gris">
              Salidas de sábado en la mañana y nuestro Club de Verano en enero. Los cupos son limitados y la
              inscripción se cierra sola cuando se llenan.
            </p>
          </div>
          {salidas.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {salidas.map((s) => (
                <TarjetaSalida key={s.id} salida={s} indice={varianteDe(s.id)} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-linea bg-white p-10 text-center">
              <p className="mano text-3xl text-marca">¡Pronto nuevas fechas!</p>
              <p className="mt-2 text-gris">
                Estamos preparando las próximas salidas. Síguenos en Instagram o escríbenos para enterarte primero.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Quiénes somos */}
      <section id="nosotros" className="scroll-mt-20 bg-crema py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl">
              <Paisaje variante={1} className="size-full" />
            </div>
            <div className="absolute -right-3 -bottom-5 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-marca/10 sm:-right-6">
              <div className="mano text-4xl text-acento">Desde {SITIO.desde}</div>
              <div className="text-sm text-gris">{anios} años llevando niños al cerro</div>
            </div>
          </div>
          <div>
            <p className="etiqueta">Quiénes somos</p>
            <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">Recuperar la niñez verdadera</h2>
            <div className="mt-5 space-y-4 text-gris">
              <p>
                En el Club de la Montaña ayudamos a madres y padres de niños y niñas de {SITIO.edades} a recuperar
                la niñez verdadera: con naturaleza, juego libre y socialización real.
              </p>
              <p>
                Inspirados en la pedagogía Waldorf, salimos al cerro a caminar, jugar, hacer talleres y juegos
                tradicionales, y a descubrir lo que nos regala la Madre Tierra en cada estación: las añañucas de
                la primavera, el sol del verano, las hojas del otoño.
              </p>
              <p>
                El club lo dirige <b className="text-tinta">{SITIO.responsable}</b>, junto a un equipo que acompaña
                a cada grupo con cariño y cuidado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Club de Verano */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative isolate overflow-hidden rounded-3xl bg-acento px-6 py-12 text-white sm:px-12">
            <Paisaje variante={2} className="absolute inset-y-0 right-0 -z-10 hidden h-full w-1/2 opacity-60 md:block" />
            <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-acento via-acento/90 to-transparent md:block" />
            <p className="mano text-3xl text-[#fde3c3]">Club de Verano</p>
            <h2 className="mt-1 max-w-lg text-3xl font-semibold sm:text-4xl">
              Las últimas tres semanas de enero, en la montaña
            </h2>
            <p className="mt-4 max-w-lg text-white/90">
              De lunes a viernes, de 9:00 a 13:00. Una semana completa de naturaleza, talleres y juego libre.
              Puedes inscribir a tus hijos por semana.
            </p>
            <Link href="#salidas" className="btn mt-7 bg-white text-acento hover:bg-crema">
              Ver semanas disponibles <IconoFlecha />
            </Link>
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
                <div className="mano flex size-11 items-center justify-center rounded-full bg-marca text-2xl text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-gris">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cuidados */}
      <section className="bg-marca py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="etiqueta !text-[#f6c68f]">Seguridad</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold sm:text-4xl">Cómo cuidamos a los niños</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {CUIDADOS.map((c, i) => {
              const Icono = ICONOS_CUIDADO[i];
              return (
                <div key={c.titulo}>
                  <Icono className="size-8 text-[#f6c68f]" />
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="etiqueta">Galería</p>
              <h2 className="mt-2 text-3xl font-semibold text-marca sm:text-4xl">Así son nuestras salidas</h2>
            </div>
            {ajustes.instagram && (
              <a
                href={`https://instagram.com/${ajustes.instagram}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 font-semibold text-bosque hover:underline"
              >
                <IconoInstagram /> Más fotos en @{ajustes.instagram}
              </a>
            )}
          </div>
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
            Aquí van las fotos de las salidas que envíe Sally (con permiso de las familias).
          </p>
        </div>
      </section>

      {/* Preguntas */}
      <section className="bg-crema py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="etiqueta text-center">Preguntas frecuentes</p>
          <h2 className="mt-2 text-center text-3xl font-semibold text-marca sm:text-4xl">Queridas familias</h2>
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
          <div className="grid items-center gap-8 rounded-3xl bg-marca p-8 text-white sm:p-12 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="mano text-3xl text-[#f6c68f]">¡Les esperamos!</p>
              <h2 className="mt-1 text-3xl font-semibold sm:text-4xl">¿Tienes dudas?</h2>
              <p className="mt-3 max-w-md text-marca-claro">
                Escríbenos si tienes preguntas sobre una salida, las edades o lo que tu hijo o hija necesita llevar.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {ajustes.whatsapp && (
                <a
                  href={linkWhatsapp(ajustes.whatsapp)}
                  className="btn bg-[#25d366] text-white hover:bg-[#1eb858]"
                  target="_blank"
                  rel="noopener"
                >
                  <IconoWhatsapp className="size-5" /> Escribir por WhatsApp
                </a>
              )}
              {ajustes.instagram && (
                <a
                  href={`https://instagram.com/${ajustes.instagram}`}
                  className="btn btn-secundario text-white"
                  target="_blank"
                  rel="noopener"
                >
                  <IconoInstagram /> @{ajustes.instagram}
                </a>
              )}
              {ajustes.email && (
                <a href={`mailto:${ajustes.email}`} className="btn btn-secundario text-white">
                  <IconoCorreo /> {ajustes.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
