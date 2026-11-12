"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CONTENIDO_POR_DEFECTO, type ContenidoSitio } from "@/lib/contenido";
import { guardarContenido } from "../acciones";

type Seccion = keyof ContenidoSitio;

/** Campo de texto de una línea o de varias, con contador cuando el límite importa. */
function Campo({
  rotulo,
  valor,
  cambiar,
  max,
  filas,
  ayuda,
}: {
  rotulo: string;
  valor: string;
  cambiar: (v: string) => void;
  max: number;
  filas?: number;
  ayuda?: string;
}) {
  const cerca = valor.length > max * 0.85;
  return (
    <label className="block">
      <span className="rotulo flex justify-between gap-2">
        {rotulo}
        {cerca && (
          <span className={`font-normal ${valor.length > max ? "text-acento" : "text-gris"}`}>
            {valor.length}/{max}
          </span>
        )}
      </span>
      {filas ? (
        <textarea rows={filas} value={valor} onChange={(e) => cambiar(e.target.value)} className="campo" />
      ) : (
        <input value={valor} onChange={(e) => cambiar(e.target.value)} className="campo" />
      )}
      {ayuda && <span className="mt-1 block text-xs text-gris">{ayuda}</span>}
    </label>
  );
}

function Interruptor({ rotulo, valor, cambiar }: { rotulo: string; valor: boolean; cambiar: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-crema px-4 py-3">
      <input type="checkbox" checked={valor} onChange={(e) => cambiar(e.target.checked)} className="size-5 accent-bosque" />
      <span className="font-semibold">{rotulo}</span>
      {!valor && <span className="ml-auto text-sm text-gris">Oculta en el sitio</span>}
    </label>
  );
}

/** Tarjeta plegable de una sección, con botón para volver al texto original. */
function Bloque({
  titulo,
  resumen,
  oculta,
  restablecer,
  children,
}: {
  titulo: string;
  resumen: string;
  oculta?: boolean;
  restablecer: () => void;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-5 sm:px-6">
        <span className="text-acento transition group-open:rotate-90" aria-hidden>
          ▶
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">
            {titulo}
            {oculta && <span className="ml-2 rounded-full bg-crema px-2 py-0.5 text-xs font-medium text-gris">Oculta</span>}
          </span>
          <span className="block truncate text-sm text-gris">{resumen}</span>
        </span>
      </summary>
      <div className="space-y-4 border-t border-linea p-5 sm:px-6">
        {children}
        <button
          type="button"
          onClick={() => {
            if (confirm(`¿Volver «${titulo}» al texto original? Los cambios de esta sección se pierden al guardar.`)) restablecer();
          }}
          className="text-sm text-gris hover:text-acento"
        >
          Volver al texto original
        </button>
      </div>
    </details>
  );
}

/** Botones para subir, bajar y quitar una fila de una lista. */
function Controles({ i, total, mover, quitar }: { i: number; total: number; mover: (de: number, a: number) => void; quitar: () => void }) {
  const clase = "rounded-lg px-2 py-1 text-gris hover:bg-crema hover:text-marca disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0 items-center gap-1 text-sm">
      <button type="button" className={clase} disabled={i === 0} onClick={() => mover(i, i - 1)} aria-label="Subir">
        ↑
      </button>
      <button type="button" className={clase} disabled={i === total - 1} onClick={() => mover(i, i + 1)} aria-label="Bajar">
        ↓
      </button>
      <button type="button" className={`${clase} hover:!text-acento`} onClick={quitar}>
        Quitar
      </button>
    </div>
  );
}

function mover<T>(lista: T[], de: number, a: number): T[] {
  const copia = [...lista];
  const [x] = copia.splice(de, 1);
  copia.splice(a, 0, x);
  return copia;
}

/** Lista de tarjetas con título y texto (pasos, cuidados). */
function ListaTarjetas({
  lista,
  cambiar,
  nombre,
  numerada,
}: {
  lista: { titulo: string; texto: string }[];
  cambiar: (l: { titulo: string; texto: string }[]) => void;
  nombre: string;
  numerada?: boolean;
}) {
  return (
    <div className="space-y-3">
      {lista.map((t, i) => (
        <div key={i} className="rounded-xl border border-linea p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-marca">
              {numerada ? `Paso ${i + 1}` : `${nombre} ${i + 1}`}
            </span>
            <Controles
              i={i}
              total={lista.length}
              mover={(de, a) => cambiar(mover(lista, de, a))}
              quitar={() => cambiar(lista.filter((_, j) => j !== i))}
            />
          </div>
          <div className="space-y-3">
            <Campo rotulo="Título" max={80} valor={t.titulo} cambiar={(v) => cambiar(lista.map((x, j) => (j === i ? { ...x, titulo: v } : x)))} />
            <Campo rotulo="Texto" max={400} filas={2} valor={t.texto} cambiar={(v) => cambiar(lista.map((x, j) => (j === i ? { ...x, texto: v } : x)))} />
          </div>
        </div>
      ))}
      {lista.length < 8 && (
        <button type="button" onClick={() => cambiar([...lista, { titulo: "", texto: "" }])} className="text-sm font-semibold text-bosque hover:underline">
          + Agregar {nombre.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export function FormularioContenido({ contenido }: { contenido: ContenidoSitio }) {
  const [c, setC] = useState(contenido);
  const [guardado, setGuardado] = useState(contenido);
  const [estado, accion, guardando] = useActionState(guardarContenido, null);
  const enviado = useRef<ContenidoSitio | null>(null);
  const hayCambios = JSON.stringify(c) !== JSON.stringify(guardado);

  // Al guardar bien, lo enviado pasa a ser lo guardado.
  useEffect(() => {
    if (estado?.ok && enviado.current) setGuardado(enviado.current);
  }, [estado]);

  // Avisa si se intenta salir con cambios sin guardar.
  useEffect(() => {
    if (!hayCambios) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [hayCambios]);

  /** Cambia un campo de una sección. */
  const poner =
    <S extends Exclude<Seccion, "pilares">>(s: S) =>
    <K extends keyof ContenidoSitio[S]>(k: K) =>
    (v: ContenidoSitio[S][K]) =>
      setC((x) => ({ ...x, [s]: { ...x[s], [k]: v } }));
  const restablecer = (s: Seccion) => () => setC((x) => ({ ...x, [s]: CONTENIDO_POR_DEFECTO[s] }));

  const encuesta = poner("encuesta");
  const portada = poner("portada");
  const fechas = poner("fechas");
  const nosotros = poner("nosotros");
  const verano = poner("verano");
  const pasos = poner("pasos");
  const cuidados = poner("cuidados");
  const preguntas = poner("preguntas");
  const contacto = poner("contacto");

  return (
    <form
      action={(f) => {
        enviado.current = c;
        accion(f);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="contenido" value={JSON.stringify(c)} />

      <Bloque
        titulo="Aviso de la encuesta de jóvenes"
        resumen={`${c.encuesta.bannerDestacado} ${c.encuesta.bannerTexto}`}
        oculta={!c.encuesta.mostrar}
        restablecer={restablecer("encuesta")}
      >
        <Interruptor rotulo="Mostrar la encuesta en el sitio" valor={c.encuesta.mostrar} cambiar={encuesta("mostrar")} />
        <p className="text-sm font-semibold text-marca">Franja de arriba de la página</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Texto destacado" max={80} valor={c.encuesta.bannerDestacado} cambiar={encuesta("bannerDestacado")} />
          <Campo rotulo="Texto del enlace" max={40} valor={c.encuesta.bannerBoton} cambiar={encuesta("bannerBoton")} />
        </div>
        <Campo rotulo="Texto" max={200} valor={c.encuesta.bannerTexto} cambiar={encuesta("bannerTexto")} />
        <p className="pt-2 text-sm font-semibold text-marca">Recuadro bajo las próximas fechas</p>
        <Campo rotulo="Título" max={120} valor={c.encuesta.titulo} cambiar={encuesta("titulo")} />
        <Campo rotulo="Texto" max={400} filas={2} valor={c.encuesta.texto} cambiar={encuesta("texto")} />
      </Bloque>

      <Bloque titulo="Portada" resumen={c.portada.titulo} restablecer={restablecer("portada")}>
        <Campo rotulo="Texto sobre el título (letra manuscrita)" max={80} valor={c.portada.antetitulo} cambiar={portada("antetitulo")} />
        <Campo rotulo="Título principal" max={120} valor={c.portada.titulo} cambiar={portada("titulo")} />
        <Campo rotulo="Bajada" max={400} filas={3} valor={c.portada.texto} cambiar={portada("texto")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Etiqueta sobre la foto" max={60} valor={c.portada.pieFoto} cambiar={portada("pieFoto")} />
          <Campo rotulo="Línea final" max={160} valor={c.portada.lineaFinal} cambiar={portada("lineaFinal")} />
        </div>
      </Bloque>

      <Bloque titulo="Pilares" resumen={c.pilares.join(" · ")} restablecer={restablecer("pilares")}>
        <p className="text-sm text-gris">Las palabras de la franja bajo la portada. Se ven mejor de a 4.</p>
        <div className="space-y-2">
          {c.pilares.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={p}
                maxLength={30}
                onChange={(e) => setC((x) => ({ ...x, pilares: x.pilares.map((y, j) => (j === i ? e.target.value : y)) }))}
                className="campo"
                aria-label={`Pilar ${i + 1}`}
              />
              <Controles
                i={i}
                total={c.pilares.length}
                mover={(de, a) => setC((x) => ({ ...x, pilares: mover(x.pilares, de, a) }))}
                quitar={() => setC((x) => ({ ...x, pilares: x.pilares.filter((_, j) => j !== i) }))}
              />
            </div>
          ))}
        </div>
        {c.pilares.length < 8 && (
          <button
            type="button"
            onClick={() => setC((x) => ({ ...x, pilares: [...x.pilares, ""] }))}
            className="text-sm font-semibold text-bosque hover:underline"
          >
            + Agregar pilar
          </button>
        )}
      </Bloque>

      <Bloque titulo="Próximas fechas" resumen={c.fechas.texto} restablecer={restablecer("fechas")}>
        <Campo rotulo="Título" max={80} valor={c.fechas.titulo} cambiar={fechas("titulo")} />
        <Campo rotulo="Texto" max={400} filas={3} valor={c.fechas.texto} cambiar={fechas("texto")} />
        <p className="pt-2 text-sm font-semibold text-marca">Cuando no hay salidas publicadas</p>
        <Campo rotulo="Título" max={80} valor={c.fechas.vacioTitulo} cambiar={fechas("vacioTitulo")} />
        <Campo rotulo="Texto" max={400} filas={2} valor={c.fechas.vacioTexto} cambiar={fechas("vacioTexto")} />
      </Bloque>

      <Bloque titulo="Quiénes somos" resumen={c.nosotros.titulo} restablecer={restablecer("nosotros")}>
        <Campo rotulo="Título" max={120} valor={c.nosotros.titulo} cambiar={nosotros("titulo")} />
        <Campo
          rotulo="Texto"
          max={3000}
          filas={9}
          valor={c.nosotros.parrafos}
          cambiar={nosotros("parrafos")}
          ayuda="Deja una línea en blanco entre párrafos. Pon **dos asteriscos** alrededor de una palabra para destacarla en negrita."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Sello sobre la foto" max={30} valor={c.nosotros.sello} cambiar={nosotros("sello")} />
          <Campo rotulo="Texto bajo el sello" max={60} valor={c.nosotros.selloTexto} cambiar={nosotros("selloTexto")} />
        </div>
      </Bloque>

      <Bloque titulo="Club de Verano" resumen={c.verano.titulo} oculta={!c.verano.mostrar} restablecer={restablecer("verano")}>
        <Interruptor rotulo="Mostrar el recuadro del Club de Verano" valor={c.verano.mostrar} cambiar={verano("mostrar")} />
        <Campo rotulo="Título (fechas y lugar)" max={200} filas={2} valor={c.verano.titulo} cambiar={verano("titulo")} />
        <Campo rotulo="Texto (horario, edades y precios)" max={800} filas={4} valor={c.verano.texto} cambiar={verano("texto")} />
        <Campo rotulo="Texto del botón" max={40} valor={c.verano.boton} cambiar={verano("boton")} />
      </Bloque>

      <Bloque titulo="Cómo inscribir" resumen={`${c.pasos.lista.length} pasos`} restablecer={restablecer("pasos")}>
        <Campo rotulo="Título de la sección" max={120} valor={c.pasos.titulo} cambiar={pasos("titulo")} />
        <ListaTarjetas lista={c.pasos.lista} cambiar={pasos("lista")} nombre="Paso" numerada />
      </Bloque>

      <Bloque titulo="Cómo cuidamos a los niños" resumen={c.cuidados.lista.map((x) => x.titulo).join(" · ")} restablecer={restablecer("cuidados")}>
        <Campo rotulo="Título de la sección" max={120} valor={c.cuidados.titulo} cambiar={cuidados("titulo")} />
        <ListaTarjetas lista={c.cuidados.lista} cambiar={cuidados("lista")} nombre="Cuidado" />
      </Bloque>

      <Bloque titulo="Galería" resumen={c.galeria.titulo} restablecer={restablecer("galeria")}>
        <Campo
          rotulo="Título de la sección"
          max={120}
          valor={c.galeria.titulo}
          cambiar={(v) => setC((x) => ({ ...x, galeria: { titulo: v } }))}
        />
      </Bloque>

      <Bloque titulo="Preguntas frecuentes" resumen={`${c.preguntas.lista.length} preguntas`} restablecer={restablecer("preguntas")}>
        <Campo rotulo="Título de la sección" max={120} valor={c.preguntas.titulo} cambiar={preguntas("titulo")} />
        <div className="space-y-3">
          {c.preguntas.lista.map((q, i) => {
            const lista = c.preguntas.lista;
            const editar = (k: "p" | "r", v: string) => preguntas("lista")(lista.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
            return (
              <div key={i} className="rounded-xl border border-linea p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-marca">Pregunta {i + 1}</span>
                  <Controles
                    i={i}
                    total={lista.length}
                    mover={(de, a) => preguntas("lista")(mover(lista, de, a))}
                    quitar={() => preguntas("lista")(lista.filter((_, j) => j !== i))}
                  />
                </div>
                <div className="space-y-3">
                  <Campo rotulo="Pregunta" max={200} valor={q.p} cambiar={(v) => editar("p", v)} />
                  <Campo rotulo="Respuesta" max={1500} filas={3} valor={q.r} cambiar={(v) => editar("r", v)} />
                </div>
              </div>
            );
          })}
        </div>
        {c.preguntas.lista.length < 30 && (
          <button
            type="button"
            onClick={() => preguntas("lista")([...c.preguntas.lista, { p: "", r: "" }])}
            className="text-sm font-semibold text-bosque hover:underline"
          >
            + Agregar pregunta
          </button>
        )}
      </Bloque>

      <Bloque titulo="Contacto" resumen={c.contacto.titulo} restablecer={restablecer("contacto")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Texto sobre el título (letra manuscrita)" max={60} valor={c.contacto.antetitulo} cambiar={contacto("antetitulo")} />
          <Campo rotulo="Título" max={120} valor={c.contacto.titulo} cambiar={contacto("titulo")} />
        </div>
        <Campo rotulo="Texto" max={400} filas={2} valor={c.contacto.texto} cambiar={contacto("texto")} />
        <p className="text-xs text-gris">El WhatsApp, el correo y el Instagram se cambian en Ajustes.</p>
      </Bloque>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-linea bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        {estado?.error && hayCambios && (
          <p role="alert" className="mr-auto rounded-xl bg-acento/10 px-4 py-2 text-sm font-medium text-acento">
            {estado.error}
          </p>
        )}
        {estado?.ok && !hayCambios && (
          <p className="mr-auto rounded-xl bg-bosque/15 px-4 py-2 text-sm font-medium text-bosque">{estado.ok}</p>
        )}
        {hayCambios && !estado?.error && <p className="mr-auto text-sm text-gris">Tienes cambios sin guardar</p>}
        {hayCambios && (
          <button type="button" onClick={() => setC(guardado)} className="px-3 py-2 text-sm text-gris hover:text-acento">
            Descartar
          </button>
        )}
        <a href="/" target="_blank" className="btn btn-secundario px-4 py-2 text-sm text-marca">
          Ver sitio ↗
        </a>
        <button type="submit" disabled={guardando || !hayCambios} className="btn btn-primario">
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
